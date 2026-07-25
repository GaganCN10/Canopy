import { useMemo } from 'react';
import { Route } from 'react-router-dom';
import CanopyAuth from './CanopyAuth';

function AuthRouteWrapper({ mode, ...rest }) {
  const element = useMemo(() => <CanopyAuth mode={mode} />, [mode]);
  return <Route {...rest} element={element} />;
}

export default AuthRouteWrapper;
