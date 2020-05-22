import has from 'lodash/has';
import includes from 'lodash/includes';
import indexOf from 'lodash/indexOf';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import set from 'lodash/set';

import {
  ELIGIBLE_FOR_UPGRADE,
  NO_AUTORENEW_COUNTRIES,
  URLS,
  WEATHERMAP_URL,
} from './server.constants';

export default class ServerCtrl {
  /* @ngInject */
  constructor(
    $q,
    $scope,
    $state,
    $stateParams,
    $timeout,
    $translate,
    constants,
    coreConfig,
    dedicatedServerFeatureAvailability,
    ovhUserPref,
    Polling,
    Server,
    User,
  ) {
    this.$q = $q;
    this.$scope = $scope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$timeout = $timeout;
    this.$translate = $translate;
    this.constants = constants;
    this.coreConfig = coreConfig;
    this.dedicatedServerFeatureAvailability = dedicatedServerFeatureAvailability;
    this.ovhUserPref = ovhUserPref;
    this.Polling = Polling;
    this.Server = Server;
    this.User = User;
  }

  $onInit() {
    this.errorStatus = ['customer_error', 'ovh_error', 'error', 'cancelled'];

    this.$scope.$state = this.$state;
    this.$scope.server = this.server;
    this.$scope.specifications = this.specifications;
    this.$scope.ola = this.ola;
    this.$scope.orderPrivateBandwidthLink = this.orderPrivateBandwidthLink;
    this.$scope.orderPublicBandwidthLink = this.orderPublicBandwidthLink;
    this.$scope.resiliatePublicBandwidthLink = this.resiliatePublicBandwidthLink;
    this.$scope.resiliatePrivateBandwidthLink = this.resiliatePrivateBandwidthLink;

    this.$scope.loadingServerInformations = true;
    this.$scope.loadingServerError = false;
    this.$scope.dedicatedServerFeatureAvailability = this.dedicatedServerFeatureAvailability;

    this.$scope.loaders = {
      autoRenew: true,
    };

    this.$scope.disable = {
      reboot: false,
      byOtherTask: false,
      install: false,
      installationInProgress: false,
      installationInProgressError: false,
      noDeleteMessage: false,
      usbStorageTab: false,
    };
    this.$scope.urlRenew = null;
    this.$scope.worldPart = this.coreConfig.getRegion();

    this.$scope.bigModalDialog = false;

    this.$scope.newDisplayName = {
      value: '',
    };

    this.$scope.autoRenew = null;
    this.$scope.autoRenewStopBother = true;
    this.$scope.autoRenewable = false;
    this.$scope.autoRenewGuide = null;
    this.$scope.hasPaymentMean = false;

    this.$scope.housingPhoneStopBother = true;
    this.$scope.housingPhoneNumber = this.constants.urls.FR.housingPhoneSupport;
    this.$scope.isHousing = false;

    this.$scope.setToBigModalDialog = (active) => {
      this.$scope.mediumModalDialog = false;
      this.$scope.bigModalDialog = active;
    };

    this.$scope.resetAction = () => {
      this.$scope.setAction(false);
      this.$scope.setToBigModalDialog(false);
    };

    this.$scope.$on('$locationChangeStart', () => {
      this.$scope.resetAction();
    });

    this.$scope.setMessage = (message, data) => {
      let messageToSend = message;
      let i = 0;
      this.$scope.alertType = '';

      if (data) {
        if (data.message) {
          messageToSend += ` (${data.message})`;
          switch (data.type) {
            case 'ERROR':
              this.$scope.alertType = 'alert-danger';
              break;
            case 'WARNING':
              this.$scope.alertType = 'alert-warning';
              break;
            case 'INFO':
              this.$scope.alertType = 'alert-success';
              break;
            default:
              break;
          }
        } else if (data.messages) {
          if (data.messages.length > 0) {
            switch (data.state) {
              case 'ERROR':
                this.$scope.alertType = 'alert-danger';
                break;
              case 'PARTIAL':
                this.$scope.alertType = 'alert-warning';
                break;
              case 'OK':
                this.$scope.alertType = 'alert-success';
                break;
              default:
                break;
            }

            messageToSend += ' (';

            for (i; i < data.messages.length; i += 1) {
              messageToSend += `${data.messages[i].id} : ${
                data.messages[i].message
              }${data.messages.length === i + 1 ? ')' : ', '}`;
            }
          }
        } else if (data.idTask && data.state) {
          switch (data.state) {
            case 'BLOCKED':
            case 'blocked':
            case 'CANCELLED':
            case 'cancelled':
            case 'PAUSED':
            case 'paused':
            case 'ERROR':
            case 'error':
              this.$scope.alertType = 'alert-danger';
              break;
            case 'WAITING_ACK':
            case 'waitingAck':
            case 'DOING':
            case 'doing':
              this.$scope.alertType = 'alert-warning';
              break;
            case 'TODO':
            case 'todo':
            case 'DONE':
            case 'done':
              this.$scope.alertType = 'alert-success';
              break;
            default:
              break;
          }
        } else if (data === 'true' || data === true) {
          this.$scope.alertType = 'alert-success';
        } else if (data.type) {
          switch (data.type) {
            case 'ERROR':
              this.$scope.alertType = 'alert-danger';
              break;
            case 'WARNING':
              this.$scope.alertType = 'alert-warning';
              break;
            case 'INFO':
              this.$scope.alertType = 'alert-success';
              break;
            default:
              break;
          }
        }
      } else if (data === 'false' || data === false) {
        this.$scope.alertType = 'alert-danger';
      }

      this.$scope.message = messageToSend;
    };

    this.$scope.setAction = (action, data) => {
      if (action) {
        this.$scope.currentAction = action;
        this.$scope.currentActionData = data;

        this.$scope.stepPath = `dedicated/server/${this.$scope.currentAction}.html`;

        $('#currentAction').modal({
          keyboard: true,
          backdrop: 'static',
        });
      } else {
        $('#currentAction').modal('hide');
        this.$scope.currentActionData = null;
        this.$timeout(() => {
          this.$scope.stepPath = '';
        }, 300);
      }
    };

    this.$scope.$on('dedicated.informations.reload', () => {
      this.loadServer();
    });

    this.$scope.isMonitoringEnabled = (protocol) =>
      this.$scope.serviceMonitoring.filter(
        (monitoring) => monitoring.enabled && monitoring.protocol === protocol,
      ).length > 0;

    this.$scope.$on('server.monitoring.reload', this.loadMonitoring);

    this.$scope.$on('$destroy', () => {
      this.Polling.addKilledScope();
    });

    // Server Restart
    this.$scope.$on('dedicated.informations.reboot', (e, _task) => {
      let task = _task;
      this.$scope.disable.reboot = true;
      task = task.data;
      task.id = task.taskId;
      this.startPollRestart(task);
    });

    // Server Install
    this.$scope.$on('dedicated.informations.reinstall', (e, task) => {
      if (!this.$scope.disable.install) {
        this.$scope.disable.install = true;
        this.checkInstallationProgress(task);
      }
    });

    // Auto renew
    this.$scope.hasAutoRenew = () => {
      this.$scope.autoRenew = false;
      if (
        NO_AUTORENEW_COUNTRIES.indexOf(this.$scope.user.ovhSubsidiary) === -1
      ) {
        return this.$q
          .all({
            serverServiceInfo: this.Server.getServiceInfos(
              this.$stateParams.productId,
            ),
            isAutoRenewable: this.Server.isAutoRenewable(
              this.$stateParams.productId,
            ),
          })
          .then((results) => {
            this.$scope.autoRenew =
              results.serverServiceInfo.renew &&
              results.serverServiceInfo.renew.automatic;
            this.$scope.autoRenewable = results.isAutoRenewable;
            this.$scope.autoRenewGuide =
              this.constants.urls[this.$scope.user.ovhSubsidiary].guides
                .autoRenew || this.constants.urls.FR.guides.autoRenew;
            this.$scope.checkIfStopBotherAutoRenew();
          });
      }
      return this.$q.when(true);
    };

    this.$scope.stopBotherAutoRenew = () => {
      this.$scope.autoRenewStopBother = true;
      let serverArrayToStopBother = [];

      this.ovhUserPref
        .getValue('SERVER_AUTORENEW_STOP_BOTHER')
        .then((data) => {
          serverArrayToStopBother = data;
          return this.Server.getSelected(this.$stateParams.productId);
        })
        .then((dedicatedServer) => {
          serverArrayToStopBother.push(dedicatedServer.name);
          return this.ovhUserPref.assign(
            'SERVER_AUTORENEW_STOP_BOTHER',
            serverArrayToStopBother,
          );
        })
        .catch((error) =>
          error.status === 404
            ? this.$scope.createStopBotherAutoRenewUserPref()
            : this.$scope.setMessage(
                this.$translate.instant('server_autorenew_stop_bother_error'),
                error.data,
              ),
        );
    };

    this.$scope.createStopBotherAutoRenewUserPref = () => {
      this.ovhUserPref.create('SERVER_AUTORENEW_STOP_BOTHER', [
        this.$scope.server.name,
      ]);
    };

    this.$scope.checkIfStopBotherAutoRenew = () =>
      this.ovhUserPref
        .getValue('SERVER_AUTORENEW_STOP_BOTHER')
        .then((serverToStopBother) => {
          this.$scope.autoRenewStopBother =
            indexOf(serverToStopBother, this.$scope.server.name) !== -1;
        })
        // eslint-disable-next-line no-return-assign
        .catch((error) =>
          error.status === 404
            ? (this.$scope.autoRenewStopBother = false)
            : this.$q.reject(error),
        );

    // IPMI Restart (other task by tab)
    this.$scope.$on('dedicated.ipmi.resetinterfaces', (e, task) => {
      this.initIpmiRestart(task);
    });

    this.$scope.createStopBotherUserPref = () => {
      this.ovhUserPref.create('HOUSING_SUPPORT_PHONE_STOP_BOTHER', true);
    };

    this.load();

    this.$scope.isEligibleForUpgrade = () => this.isEligibleForUpgrade();
    this.$scope.URLS = URLS;
  }

  load() {
    this.User.getUrlOf('changeOwner').then((link) => {
      this.$scope.changeOwnerUrl = link;
    });

    this.$scope.loaders.autoRenew = true;

    this.$q
      .all({
        user: this.User.getUser(),
        paymentIds:
          this.coreConfig.getRegion() !== 'US'
            ? this.User.getValidPaymentMeansIds()
            : this.$q.when([]),
      })
      .then((data) => {
        this.$scope.user = data.user;
        this.$scope.hasPaymentMean = data.paymentIds.length > 0;
        this.$scope.hasAutoRenew();
        this.checkIfStopBotherHousingPhone();
      })
      .finally(() => {
        this.$scope.loaders.autoRenew = false;
      });

    this.loadServer()
      .then(() => this.loadMonitoring())
      .then(() => this.getTaskInProgress())
      .finally(() => {
        if (this.$scope.server.canTakeRendezVous) {
          this.$state.go('app.dedicated.server.rendezvous');
        }
      });
  }

  loadServer() {
    if (!this.$scope.disable.noDeleteMessage) {
      this.$scope.message = null;
    } else {
      this.$scope.disable.noDeleteMessage = false;
    }

    this.Server.getUrlRenew(this.$stateParams.productId).then((url) => {
      this.$scope.urlRenew = url;
    });

    this.Server.getUsbStorageInformations(this.$stateParams.productId).then(
      (result) => {
        if (isArray(result) && result[1].usbKeys) {
          this.$scope.disable.usbStorageTab = true;
        }
      },
    );

    return this.$q
      .allSettled([
        this.Server.getServiceInfos(this.$stateParams.productId),
        this.Server.getVrackInfos(this.$stateParams.productId),
      ])
      .then((data) => {
        const [serviceInfos, vrackInfos] = data;
        const expiration = moment.utc(this.$scope.server.expiration);

        set(
          this.$scope.server,
          'expiration',
          moment([
            expiration.year(),
            expiration.month(),
            expiration.date(),
          ]).toDate(),
        );

        const creation = moment.utc(serviceInfos.creation);

        set(
          this.$scope.server,
          'creation',
          moment([creation.year(), creation.month(), creation.date()]).toDate(),
        );

        /* if there is no os installed, the api return "none_64" */
        if (/^none_\d{2}?$/.test(this.server.os)) {
          this.$scope.server.os = null;
        }

        this.$scope.infoServer = {
          dc: this.$scope.server.datacenter.replace('_', ' '),
          dcImage: this.$scope.server.datacenter.replace(/_.*/g, ''),
          rack: this.$scope.server.rack,
          serverId: this.$scope.server.serverId,
        };
        this.$scope.vrackInfos = vrackInfos;

        this.$scope.loadingServerInformations = false;
        this.$scope.isHousing = ServerCtrl.isHousing(this.server);
        this.$scope.serviceInfos = serviceInfos;

        this.$scope.tabOptions = {
          isFirewallEnabled: this.dedicatedServerFeatureAvailability.allowDedicatedServerFirewallCiscoAsa(),
          isIPMIDisabled: this.$scope.isHousing,
          isUSBStorageEnabled: this.dedicatedServerFeatureAvailability.allowDedicatedServerUSBKeys(),
        };

        this.$scope.$broadcast('dedicated.server.refreshTabs');

        if (this.isEligibleForUpgrade()) {
          this.Server.getUpgradeProductName(
            ELIGIBLE_FOR_UPGRADE.PLAN_NAME,
            this.$scope.user.ovhSubsidiary,
          ).then((upgradeName) => {
            this.$scope.upgradeName = upgradeName;
          });
        }
      })
      .catch((data) => {
        this.$scope.loadingServerInformations = false;
        this.$scope.loadingServerError = true;
        set(data, 'type', 'ERROR');
        this.$scope.setMessage(
          this.$translate.instant('server_dashboard_loading_error'),
          data,
        );
      });
  }

  loadMonitoring() {
    return this.$q
      .all([
        this.Server.getModels(),
        this.Server.getAllServiceMonitoring(this.$stateParams.productId),
      ])
      .then(([models, allServiceMonitoring]) => {
        this.$scope.monitoringProtocolEnum =
          models.data.models['dedicated.server.MonitoringProtocolEnum'].enum;
        this.$scope.serviceMonitoring = allServiceMonitoring;
        this.$scope.servicesStateLinks = {
          weathermap: WEATHERMAP_URL,
          vms: this.constants.vmsUrl,
          travaux: this.constants.travauxUrl,
        };
      })
      .catch((err) => {
        set(err, 'data.type', 'ERROR');
        this.$scope.setMessage(
          this.$translate.instant('server_dashboard_loading_error'),
          err.data,
        );
      });
  }

  getTaskInProgress() {
    return this.$q
      .all({
        hardRebootTasks: this.Server.getTaskInProgress(
          this.$stateParams.productId,
          'hardReboot',
        ),
        resetIPMITasks: this.Server.getTaskInProgress(
          this.$stateParams.productId,
          'resetIPMI',
        ),
        reinstallServerTasks: this.Server.getTaskInProgress(
          this.$stateParams.productId,
          'reinstallServer',
        ),
      })
      .then(({ hardRebootTasks, resetIPMITasks, reinstallServerTasks }) => {
        if (isArray(hardRebootTasks) && !isEmpty(hardRebootTasks)) {
          this.$scope.$broadcast(
            'dedicated.informations.reboot',
            hardRebootTasks[0],
          );
        }

        // Do not call broadcast dedicated.ipmi.resetinterfaces
        if (isArray(resetIPMITasks) && !isEmpty(resetIPMITasks)) {
          this.initIpmiRestart(resetIPMITasks[0]);
        }

        if (isArray(reinstallServerTasks) && !isEmpty(reinstallServerTasks)) {
          this.$scope.$broadcast(
            'dedicated.informations.reinstall',
            reinstallServerTasks[0],
          );
        } else if (!has(reinstallServerTasks, 'messages')) {
          this.checkInstallationProgress();
        } else {
          this.$scope.$broadcast('dedicated.server.refreshTabs');
        }
      });
  }

  startPollRestart(task) {
    this.Server.addTask(this.$stateParams.productId, task, this.$scope.$id)
      .then((state) => {
        if (this.Polling.isResolve(state)) {
          this.$scope.disable.reboot = false;
          this.$scope.$broadcast('dedicated.informations.reboot.done');
          this.$scope.setMessage(
            this.$translate.instant('server_configuration_reboot_successfull', {
              t0: this.$scope.server.name,
            }),
            true,
          );
        } else {
          this.startPollRestart(task);
        }
      })
      .catch((data) => {
        this.$scope.disable.reboot = false;
        this.$scope.$broadcast('dedicated.informations.reboot.done');
        set(data, 'type', 'ERROR');
        this.$scope.setMessage(
          this.$translate.instant('server_configuration_reboot_fail_task'),
          data,
        );
      });
  }

  checkInstallationProgress(task) {
    this.Server.progressInstallation(this.$stateParams.productId)
      .then((installationStep) => {
        this.$scope.disable.installationInProgress = true;
        this.$scope.disable.installationInProgressError = false;
        angular.forEach(installationStep.progress, (value) => {
          if (
            includes(this.errorStatus, value.status.toString().toLowerCase())
          ) {
            this.$scope.disable.installationInProgressError = true;
            this.$scope.disable.install = false;
          }
        });

        if (!this.$scope.disable.installationInProgressError && task) {
          this.startPollReinstall(task);
        }
      })
      .catch((err) => {
        if (err.status === 404) {
          if (this.$scope.disable.installationInProgress) {
            this.$scope.disable.noDeleteMessage = true;
            this.$scope.setMessage(
              this.$translate.instant(
                'server_configuration_installation_progress_end',
              ),
              true,
            );
            this.$scope.$broadcast('dedicated.informations.reload');
          }

          this.$scope.disable.install = false;
          this.$scope.disable.installationInProgress = false;
          this.$scope.disable.installationInProgressError = false;
          this.$scope.loadingServerInformations = false;
          this.$scope.$broadcast('dedicated.server.refreshTabs');
          return;
        }

        if (task) {
          this.startPollReinstall(task);
        } else {
          this.$scope.setMessage(
            this.$translate.instant(
              'server_configuration_installation_fail_task',
              { t0: this.$scope.server.name },
            ),
            false,
          );
        }
      });
  }

  startPollReinstall(task) {
    this.Server.addTask(this.$stateParams.productId, task, this.$scope.$id)
      .then((state) => {
        if (this.Polling.isResolve(state)) {
          if (this.Polling.isDone(state)) {
            this.checkInstallationProgress();
          }
        } else {
          this.checkInstallationProgress(task);
        }
      })
      .catch((data) => {
        this.$scope.disable.install = false;
        set(data, 'type', 'ERROR');
        this.$scope.setMessage(
          this.$translate.instant(
            'server_configuration_installation_fail_task',
            {
              t0: this.$scope.server.name,
            },
          ),
          data,
        );
      });
  }

  initIpmiRestart(task) {
    this.$scope.disable.byOtherTask = true;
    this.startIpmiPollRestart(task);
  }

  startIpmiPollRestart(task) {
    this.$scope.disable.byOtherTask = true;

    this.Server.addTaskFast(this.$stateParams.productId, task, this.$scope.$id)
      .then((state) => {
        if (this.Polling.isResolve(state)) {
          this.$scope.disable.byOtherTask = false;
        } else {
          this.startIpmiPollRestart(task);
        }
      })
      .catch(() => {
        this.$scope.disable.byOtherTask = false;
      });
  }

  checkIfStopBotherHousingPhone() {
    return this.ovhUserPref
      .getValue('HOUSING_SUPPORT_PHONE_STOP_BOTHER')
      .then((stopBother) => {
        this.$scope.housingPhoneStopBother = stopBother;
      })
      .catch(() => {
        this.$scope.housingPhoneStopBother = false;
      });
  }

  static isHousing(dedicatedServer) {
    return dedicatedServer.commercialRange === 'housing';
  }

  isEligibleForUpgrade() {
    return includes(
      ELIGIBLE_FOR_UPGRADE.SUBSIDIARIES,
      this.$scope.user.ovhSubsidiary,
    );
  }
}
