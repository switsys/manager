import assign from 'lodash/assign';

angular.module('managerApp').controller(
  'TelecomTelephonyLinePhoneCtrl',

  class TelecomTelephonyLinePhoneCtrl {
    constructor(
      $q,
      $stateParams,
      $translate,
      OvhApiTelephony,
      TelephonyMediator,
    ) {
      this.$q = $q;
      this.$stateParams = $stateParams;
      this.$translate = $translate;
      this.OvhApiTelephony = OvhApiTelephony;
      this.TelephonyMediator = TelephonyMediator;
    }

    /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

    $onInit() {
      this.actions = null;
      this.line = null;
      this.billingAccount = null;
      this.loading = {
        init: false,
      };

      this.init();
    }

    /* -----  End of INITIALIZATION  ------*/

    isAllowedOrder(orderName) {
      return !!(
        this.billingAccount.availableOrders &&
        this.billingAccount.availableOrders.indexOf(orderName) > -1
      );
    }

    initActions() {
      this.actions = [
        {
          name: 'line_details_phon_offer',
          sref: 'telecom.telephony.billingAccount.line.phone.details',
          text: this.$translate.instant(
            'telephony_line_phone_actions_line_details_phon_offer',
          ),
        },
        {
          name: 'line_codecs_management',
          sref: 'telecom.telephony.billingAccount.line.phone.codec',
          text: this.$translate.instant(
            'telephony_line_phone_actions_line_codecs_management',
          ),
        },
        {
          name: 'line_plug_and_phone_custom_parameters_list',
          disabled:
            !this.line.phone || this.line.phone.configurations.length === 0,
          sref: 'telecom.telephony.billingAccount.line.phone.configuration',
          text: this.$translate.instant(
            'telephony_line_phone_actions_line_plug_and_phone_custom_parameters_list',
          ),
        },
        {
          name: 'line_programmable_keys',
          main: true,
          disabled: !this.line.hasPhone,
          picto: 'ovh-font-programmableKeys',
          sref: 'telecom.telephony.billingAccount.line.phone.programmableKeys',
          text: this.$translate.instant(
            'telephony_line_phone_actions_line_programmable_keys',
          ),
        },
        {
          name: 'line_phone_reboot',
          disabled: !this.line.hasPhone,
          sref: 'telecom.telephony.billingAccount.line.phone.reboot',
          text: this.$translate.instant(
            'telephony_line_phone_actions_line_phone_reboot',
          ),
        },
        {
          name: 'line_phone_order_plug_and_phone',
          sref: 'telecom.telephony.billingAccount.line.phone.order',
          text: this.line.hasPhone
            ? this.$translate.instant(
                'telephony_line_phone_actions_line_phone_change_phone',
              )
            : this.$translate.instant(
                'telephony_line_phone_actions_line_phone_order_phone',
              ),
        },
        {
          name: 'line_order_accessories',
          sref: 'telecom.telephony.billingAccount.line.phone.accessories',
          disabled: !(
            this.isAllowedOrder('accessory') ||
            this.isAllowedOrder('accessories')
          ),
          text: this.$translate.instant(
            'telephony_line_phone_actions_line_order_accessories',
          ),
        },
        {
          name: 'line_phonebook',
          main: true,
          disabled: !this.line.hasPhone || !this.line.hasSupportsPhonebook,
          picto: 'ovh-font-contacts',
          sref: 'telecom.telephony.billingAccount.line.phone.phonebook',
          text: this.$translate.instant(
            'telephony_line_phone_actions_line_phonebook',
          ),
        },
        {
          name: 'line_phone_order_attach',
          sref: 'telecom.telephony.billingAccount.line.phone.attach',
          disabled:
            (!this.line.hasPhone && this.line.isAttachedToOtherLinesPhone) ||
            this.line.hasPhone,
          text:
            this.line.isAttachedToOtherLinesPhone && this.line.hasPhone
              ? this.$translate.instant(
                  'telephony_line_phone_actions_line_phone_order_detach',
                )
              : this.$translate.instant(
                  'telephony_line_phone_actions_line_phone_order_attach',
                ),
        },
      ];
    }

    init() {
      this.loading.init = true;

      return this.TelephonyMediator.getGroup(this.$stateParams.billingAccount)
        .then((group) => {
          this.billingAccount = group;
          this.line = this.billingAccount.getLine(
            this.$stateParams.serviceName,
          );
        })
        .then(() =>
          this.OvhApiTelephony.Line()
            .v6()
            .get({
              billingAccount: this.line.billingAccount,
              serviceName: this.line.serviceName,
            })
            .$promise.then((result) => {
              assign(this.line, {
                isAttachedToOtherLinesPhone: result.isAttachedToOtherLinesPhone,
              });

              return this.$q
                .allSettled([
                  this.line.getPhone(),
                  this.line.supportsPhonebook(),
                  this.billingAccount.getAvailableOrderNames(),
                ])
                .then(() => {
                  this.initActions();
                });
            }),
        )
        .finally(() => {
          this.loading.init = false;
        });
    }
  },
);
