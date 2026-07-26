import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import RoleRequest from '../models/RoleRequest.js';
import RoleProfile from '../models/RoleProfile.js';
import InviteCode from '../models/InviteCode.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';
import { sendEmail } from '../utils/email.js';

const REQUESTABLE_ROLES = ['researcher_ngo', 'ranger', 'rescue_center_staff'];
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'gcn3888@gmail.com';

const generateDecisionToken = (requestId, adminEmail) => {
  const payload = {
    requestId,
    adminEmail,
    purpose: 'role-decision',
  };
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: '72h' });
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const mapRoleToUserRole = (requestedRole) => {
  const roleMap = {
    researcher_ngo: 'researcher',
    ranger: 'ranger',
    rescue_center_staff: 'rescue',
  };
  return roleMap[requestedRole] || requestedRole;
};

export const createRoleRequest = async (userId, requestData, documentFile = null) => {
  const { requestedRole, reason, orgOrDeptName, inviteCode } = requestData;

  if (!REQUESTABLE_ROLES.includes(requestedRole)) {
    throw new Error('Invalid requested role');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const elevatedRoles = ['ranger', 'researcher', 'rescue', 'admin'];

  if (elevatedRoles.includes(user.role)) {
    throw new Error('Only Citizen/Volunteer users can request role elevation');
  }

  const existingPending = await RoleRequest.findOne({
    user: userId,
    requestedRole,
    status: 'pending',
  });
  if (existingPending) {
    throw new Error('You already have a pending request for this role');
  }

  let documentPath = null;
  let documentOriginalName = null;

  if (documentFile) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = documentFile.originalname.split('.').pop();
    documentPath = `uploads/documents/${uniqueSuffix}.${ext}`;
    documentOriginalName = documentFile.originalname;
  }

  if (requestedRole === 'ranger' && inviteCode) {
    const code = await InviteCode.findOne({
      code: inviteCode.toUpperCase(),
      role: 'ranger',
      usedBy: null,
      expiresAt: { $gt: new Date() },
    });
    if (!code) {
      throw new Error('Invalid or expired invite code');
    }
  }

  const decisionToken = generateDecisionToken(undefined, ADMIN_NOTIFICATION_EMAIL);
  const decisionTokenHash = hashToken(decisionToken);

  const roleRequest = await RoleRequest.create({
    user: userId,
    requestedRole,
    reason,
    orgOrDeptName,
    documentFile: documentPath,
    documentOriginalName,
    inviteCode: inviteCode || null,
    decisionToken: decisionTokenHash,
    decisionTokenExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
  });

  const adminEmailHtml = `
    <h2>New Role Request</h2>
    <p><strong>User:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
    <p><strong>Requested Role:</strong> ${requestedRole}</p>
    <p><strong>Organization/Department:</strong> ${orgOrDeptName}</p>
    <p><strong>Reason:</strong></p>
    <p>${reason}</p>
    ${documentPath ? `<p><strong>Document:</strong> <a href="${process.env.BASE_URL || 'http://localhost:5173'}/api/role-requests/${roleRequest._id}/document">View Document</a></p>` : ''}
    <p>
      <a href="${process.env.BASE_URL || 'http://localhost:5173'}/api/role-requests/${roleRequest._id}/decide?token=${decisionToken}&action=approve">Approve</a> |
      <a href="${process.env.BASE_URL || 'http://localhost:5173'}/api/role-requests/${roleRequest._id}/decide?token=${decisionToken}&action=reject">Reject</a>
    </p>
  `;

  await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `New Role Request: ${user.firstName} ${user.lastName} → ${requestedRole}`,
    html: adminEmailHtml,
  });

  logger.info(`Role request created: ${roleRequest._id} by user ${userId} for role ${requestedRole}`);

  return roleRequest;
};

export const getRoleRequests = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.requestedRole) {
    query.requestedRole = filters.requestedRole;
  }
  if (filters.userId) {
    query.user = filters.userId;
  }

  const requests = await RoleRequest.find(query)
    .populate('user', 'firstName lastName email role')
    .populate('reviewedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();

  return requests;
};

export const getMyRoleRequests = async (userId) => {
  const requests = await RoleRequest.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
  return requests;
};

export const decideRoleRequest = async (requestId, action, adminUserId, reason = null) => {
  const roleRequest = await RoleRequest.findById(requestId);
  if (!roleRequest) {
    throw new Error('Role request not found');
  }

  if (roleRequest.status !== 'pending') {
    throw new Error('This request has already been decided');
  }

  if (action === 'approve') {
    roleRequest.status = 'approved';
  } else if (action === 'reject') {
    roleRequest.status = 'rejected';
    roleRequest.rejectionReason = reason;
  } else {
    throw new Error('Invalid action');
  }

  roleRequest.reviewedBy = adminUserId;
  roleRequest.reviewedAt = new Date();

  await roleRequest.save();

  const user = await User.findById(roleRequest.user);
  if (!user) {
    throw new Error('User not found');
  }

  const actionText = action === 'approve' ? 'approved' : 'rejected';
  const subject = `Your role request has been ${actionText}`;
  const html = `
    <h2>Role Request ${actionText === 'approved' ? 'Approved' : 'Rejected'}</h2>
    <p>Your request for the <strong>${roleRequest.requestedRole}</strong> role has been ${actionText}.</p>
    ${action === 'rejected' && reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    ${action === 'approved' ? '<p>Please complete your role profile to activate your new permissions.</p>' : '<p>You may resubmit a new request if needed.</p>'}
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });

  logger.info(`Role request ${requestId} ${actionText} by admin ${adminUserId}`);

  return roleRequest;
};

export const submitRoleProfile = async (userId, roleProfileData) => {
  const { role, fields } = roleProfileData;

  if (!['researcher_ngo', 'ranger', 'rescue_center_staff'].includes(role)) {
    throw new Error('Invalid role');
  }

  const approvedRequest = await RoleRequest.findOne({
    user: userId,
    requestedRole: role,
    status: 'approved',
  });

  if (!approvedRequest) {
    throw new Error('No approved role request found for this role');
  }

  const existingProfile = await RoleProfile.findOne({ user: userId });
  if (existingProfile) {
    throw new Error('Role profile already exists for this user');
  }

  await RoleProfile.create({
    user: userId,
    role,
    fields: fields || {},
  });

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.role = mapRoleToUserRole(role);
  await user.save();

  logger.info(`User ${userId} role updated to ${user.role} after role profile submission`);

  return user;
};

export const generateInviteCode = async (adminUserId, expiryDays = 30) => {
  const admin = await User.findById(adminUserId);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Only admins can generate invite codes');
  }

  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  const inviteCode = await InviteCode.create({
    code,
    role: 'ranger',
    issuedBy: adminUserId,
    expiresAt,
  });

  logger.info(`Invite code ${code} generated by admin ${adminUserId}`);

  return inviteCode;
};

export const getInviteCodes = async () => {
  const codes = await InviteCode.find()
    .populate('issuedBy', 'firstName lastName email')
    .populate('usedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();
  return codes;
};

export const useInviteCode = async (userId, code) => {
  const inviteCode = await InviteCode.findOne({
    code: code.toUpperCase(),
    usedBy: null,
    expiresAt: { $gt: new Date() },
  });

  if (!inviteCode) {
    throw new Error('Invalid or expired invite code');
  }

  inviteCode.usedBy = userId;
  await inviteCode.save();

  return inviteCode;
};
