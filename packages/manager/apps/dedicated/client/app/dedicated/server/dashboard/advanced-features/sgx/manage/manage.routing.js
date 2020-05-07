import DedicatedServerDashboardSgxManage from './manage.service';

export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state('app.dedicated.server.dashboard.sgx.manage', {
    params: {
      goBack: null,
    },
    url: '/manage',
    views: {
      'tabView@app.dedicated.server': {
        component: 'dedicatedServerDashboardSgxManage',
      },
    },
    resolve: {
      activationMode: /* @ngInject */ (biosSettinsSgx) => biosSettinsSgx.status,
      activationModeValues: /* @ngInject */ (schema) =>
        DedicatedServerDashboardSgxManage.buildActivationMode(schema),
      biosSettinsSgx: /* @ngInject */ (
        $window,
        OvhApiDedicatedServer,
        serverName,
      ) =>
        $window.location.host === 'localhost:9000'
          ? {
              prmrr: '128MB',
              status: 'disabled',
            }
          : OvhApiDedicatedServer.BiosSettings()
              .v6()
              .getFeature({
                serverName,
                featureName: 'sgx',
              }).$promise,
      prmrr: /* @ngInject */ (biosSettinsSgx) => biosSettinsSgx.prmrr,
      prmrrValues: /* @ngInject */ (schema) =>
        DedicatedServerDashboardSgxManage.buildPrmrr(schema),

      goBack: /* @ngInject */ ($state, $transition$) => (
        params = {},
        transitionParams,
      ) =>
        ($transition$.params().goBack &&
          $transition$.params().goBack(params, transitionParams)) ||
        $state.go('app.dedicated.server.dashboard', params, transitionParams),
      goToConfirm: /* @ngInject */ ($state) => (activationMode, prmrr) =>
        $state.go('app.dedicated.server.dashboard.sgx.manage.confirmation', {
          activationMode,
          prmrr,
        }),
    },
  });
};
