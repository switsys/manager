export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state(
    'app.dedicated.server.dashboard.sgx.manage.confirmation',
    {
      views: {
        modal: {
          component: 'dedicatedServerDashboardSgxManageConfirmation',
        },
      },
      layout: 'modal',
      resolve: {
        confirm: /* @ngInject */ (
          $translate,
          $window,
          goToDashboard,
          OvhApiDedicatedServer,
          serverName,
        ) => (activationMode, prmrr) =>
          $window.location.host === 'localhost:9000'
            ? goToDashboard({
                message: {
                  text: $translate.instant(
                    'dedicated_server_dashboard_advanced_features_sgx_manage_success',
                  ),
                  type: 'DONE',
                },
              })
            : OvhApiDedicatedServer.BiosSettings()
                .v6()
                .configureFeature(
                  {
                    serverName,
                    featureName: 'sgx',
                  },
                  {
                    prmrr,
                    status: activationMode,
                  },
                )
                .$promise.then(() =>
                  goToDashboard({
                    message: {
                      text: $translate.instant(
                        'dedicated_server_dashboard_advanced_features_sgx_manage_success',
                      ),
                      type: 'DONE',
                    },
                  }).catch((error) =>
                    goToDashboard({
                      message: {
                        text: $translate.instant(
                          'dedicated_server_dashboard_advanced_features_sgx_manage_success',
                        ),
                        data: error,
                        type: 'DONE',
                      },
                    }),
                  ),
                ),
        goBack: /* @ngInject */ ($state) => (params = {}, transitionParams) =>
          $state.go(
            'app.dedicated.server.dashboard.sgx.manage',
            params,
            transitionParams,
          ),
      },
    },
  );
};
