import controller from './hosting.controller';
import template from './hosting.html';

import { LOCAL_SEO_FAMILY } from './local-seo/local-seo.constants';

export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state('app.hosting', {
    url: '/configuration/hosting/:productId?tab',
    template,
    controller,
    controllerAs: '$ctrl',
    reloadOnSearch: false,
    params: {
      tab: null,
    },
    resolve: {
      availableOptions: /* @ngInject */ (WucOrderCartService, serviceName) =>
        WucOrderCartService.getProductServiceOptions(
          'webHosting',
          serviceName,
        ).catch(() => []),
      emailOptionIds: /* @ngInject */ (hostingEmailService, serviceName) =>
        hostingEmailService.getEmailOptionList(serviceName),
      emailOptionDetachInformation: /* @ngInject */ (
        $q,
        emailOptionServiceInfos,
        ovhManagerProductOffersDetachService,
      ) =>
        $q.all(
          emailOptionServiceInfos.map(({ serviceId }) =>
            ovhManagerProductOffersDetachService
              .getAvailableDetachPlancodes(serviceId)
              .catch(() => [])
              .then((plancodes) => ({
                serviceId,
                detachPlancodes: plancodes,
              })),
          ),
        ),
      emailOptionServiceInfos: /* @ngInject */ (
        $q,
        emailOptionIds,
        hostingEmailService,
        OvhApiEmailDomain,
        serviceName,
      ) =>
        $q
          .all(
            emailOptionIds.map((emailOptionId) =>
              hostingEmailService
                .getEmailOptionServiceInformation(serviceName, emailOptionId)
                .then(
                  ({ resource }) =>
                    OvhApiEmailDomain.v6().serviceInfos({
                      serviceName: resource.name,
                    }).$promise,
                ),
            ),
          )
          .then((servicesInformation) => servicesInformation.flatten()),
      pendingTasks: /* @ngInject */ (HostingTask, serviceName) =>
        HostingTask.getPending(serviceName).catch(() => []),
      serviceName: /* @ngInject */ ($transition$) =>
        $transition$.params().productId,
      statisticsRoute: /* @ngInject */ (HostingStatistics, serviceName) =>
        HostingStatistics.getStatisticsInterfaceRoute(serviceName),
      goToDetachEmail: /* @ngInject */ ($state) => () =>
        $state.go('app.hosting.detachEmail'),
      goToHosting: /* @ngInject */ ($state, $timeout, Alerter) => (
        message = false,
        type = 'success',
      ) => {
        const promise = $state.go('app.hosting', {});

        if (message) {
          promise.then(() =>
            $timeout(() =>
              Alerter.set(`alert-${type}`, message, null, 'app.alerts.main'),
            ),
          );
        }

        return promise;
      },
      navigationInformations: /* @ngInject */ (Navigator, $rootScope) => {
        // eslint-disable-next-line no-param-reassign
        $rootScope.currentSectionInformation = 'hosting';
        return Navigator.setNavigationInformation({
          leftMenuVisible: true,
          configurationSelected: true,
        });
      },
      isLocalSeoAvailable: /* @ngInject */ (availableOptions) =>
        availableOptions.find(({ family }) => family === LOCAL_SEO_FAMILY),
    },
    translations: { value: ['.'], format: 'json' },
  });

  $stateProvider.state('app.hosting.upgrade', {
    url: '/change-offer',
    templateUrl: 'hosting/offer/upgrade/hosting-offer-upgrade.html',
    controller: 'HostingUpgradeOfferCtrl',
    reloadOnSearch: false,
    translations: ['.'],
  });
};
