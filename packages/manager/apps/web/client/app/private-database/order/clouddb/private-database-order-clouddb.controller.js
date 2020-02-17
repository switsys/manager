import get from "lodash/get";
import orderBy from "lodash/orderBy";
import sortBy from "lodash/sortBy";

import {
  DATACENTER_CONFIGURATION_LABEL,
  ENGINE_CONFIGURATION_LABEL,
  PLAN_CODE_TEMPLATE,
  PRODUCT_NAME
} from "./private-database-order-clouddb.constants";

import { ORDER_TYPE } from "../../../../../../../modules/web-universe-components/src/order/order.constants";

export default class PrivateDatabaseOrderCloudDbCtrl {
  /* @ngInject */
  constructor(
    $scope,
    $element,
    $filter,
    $translate,
    PrivateDatabaseOrderCloudDb
  ) {
    this.$scope = $scope;
    this.$element = $element;
    this.$filter = $filter;
    this.$translate = $translate;
    this.PrivateDatabaseOrderCloudDb = PrivateDatabaseOrderCloudDb;
  }

  $onInit() {
    this.currentIndex = 0;
    this.model = {
      productName: PRODUCT_NAME,
      orderType: ORDER_TYPE.RENEW
    };

    this.stencilType = "Type: button";

    const stencilComp = document.querySelector("#stencilButtonClicker");
    stencilComp.callback = this.getFunctionLogger();

    const stencilDatagrid = document.querySelector("#stencilDatagrid");
    stencilDatagrid.providedData = [
      { id: 0, firstName: "Jérémy", lastName: "DE CESARE" },
      { id: 1, firstName: "Frédéric", lastName: "ESPIAU" },
      { id: 2, firstName: "Axel", lastName: "PETER" },
      { id: 3, firstName: "Cyrille", lastName: "BOURGOIS" }
    ];
  }

  initializeCustomizationOptions() {
    this.model.engine = undefined;
    this.model.ramSize = undefined;
    this.model.datacenter = undefined;

    this.engineList = orderBy(
      this.engines.map(engine => {
        const [engineLabel, engineVersion] = engine.split("_");

        return {
          engineLabel,
          engineVersion: parseFloat(engineVersion),
          label: this.$translate.instant(
            `private_database_order_clouddb_server_version_${engineLabel}`,
            {
              version: engineVersion
            }
          ),
          value: engine
        };
      }),
      ["engineLabel", "engineVersion"],
      ["asc", "desc"]
    );

    this.ramSizeList = sortBy(
      this.ramSizes
        .map(ram => parseInt(ram, 10))
        .map(ram => ({
          label: this.$filter("cucBytes")(ram, undefined, false, "MB"),
          value: ram
        })),
      "value"
    );

    this.datacenterList = this.datacenters.map(datacenter => ({
      label: this.$translate.instant(
        `private_database_order_clouddb_datacenter_${datacenter}`
      ),
      value: datacenter
    }));
  }

  onConfigurationFinish() {
    const planCode = PLAN_CODE_TEMPLATE.replace(
      /{{RAM}}/,
      this.model.ramSize.value
    );

    return planCode;
  }

  canGoToDurationStep() {
    if (this.model.engine && this.model.ramSize && this.model.datacenter) {
      this.currentIndex += 1;
    }
  }

  getOrderState(state) {
    this.orderState = state;
  }

  getDurationsAndPricings() {
    this.model.duration = undefined;
    this.loadingDurations = true;
    const ramSizeRegExp = new RegExp(this.model.ramSize.value);
    return this.PrivateDatabaseOrderCloudDb.getDurationsFromRamOption(
      this.cartId,
      this.model.ramSize.value
    )
      .then(durations => {
        const catalogPrices = this.catalog.plans.find(({ planCode }) =>
          ramSizeRegExp.test(planCode)
        ).pricings;

        this.durations = durations
          .map(duration => {
            const pricing = catalogPrices.find(
              ({ interval }) => interval === duration.interval
            );

            return {
              ...duration,
              price: pricing.price,
              tax: pricing.tax
            };
          })
          .filter(({ interval }) => interval > 0);
      })
      .finally(() => {
        this.loadingDurations = false;
      });
  }

  goToPaymentStep() {
    if (this.model.duration) {
      this.currentIndex += 1;
    }
  }

  getConfiguration() {
    return [
      {
        label: DATACENTER_CONFIGURATION_LABEL,
        value: this.model.datacenter.value
      },
      {
        label: ENGINE_CONFIGURATION_LABEL,
        value: this.model.engine.value
      }
    ];
  }

  prepareCheckout() {
    this.loadingCheckout = true;
    const checkoutData = {
      datacenter: this.model.datacenter.value,
      engine: this.model.engine.value,
      ramSize: this.model.ramSize.value,
      duration: this.model.duration.duration,
      pricingMode: this.model.duration.pricingMode
    };

    return this.PrivateDatabaseOrderCloudDb.prepareCheckout(
      this.cartId,
      checkoutData
    )
      .then(({ contracts, prices }) => {
        this.contracts = contracts;
        this.prices = prices;
      })
      .catch(error => {
        this.displayErrorMessage(
          `${this.$translate.instant(
            "private_database_order_clouddb_payment_get_checkout_error"
          )} ${get(error, "data.message", error.message)}`
        );
      })
      .finally(() => {
        this.loadingCheckout = false;
      });
  }

  validateCheckout() {
    this.loadingCheckout = true;
    return this.PrivateDatabaseOrderCloudDb.validateCheckout(this.cartId, {
      autoPayWithPreferredPaymentMethod: this.autoPayWithPreferredPaymentMethod,
      waiveRetractionPeriod: false
    })
      .then(({ prices, url }) => {
        this.hasValidatedCheckout = true;
        if (!this.autoPayWithPreferredPaymentMethod) {
          this.openBill(url);
          this.displaySuccessMessage(
            `${this.$translate.instant(
              "private_database_order_clouddb_bill_success",
              { billUrl: url }
            )}`
          );
        } else {
          this.displaySuccessMessage(
            `${this.$translate.instant(
              "private_database_order_clouddb_payment_checkout_success",
              {
                accountId: this.defaultPaymentMean.label,
                price: prices.withTax.text,
                billUrl: url
              }
            )}`
          );
        }
      })
      .catch(() => {
        this.displayErrorMessage(
          `${this.$translate.instant(
            "private_database_order_clouddb_payment_checkout_error"
          )}`
        );
      })
      .finally(() => {
        this.loadingCheckout = false;
      });
  }

  displayErrorGetPaymentMethod() {
    this.displayErrorMessage(
      this.$translate.instant(
        "private_database_order_clouddb_payment_get_payment_method_error"
      )
    );
  }

  getFunctionLogger() {
    const { model } = this;
    return function() {
      console.log(model);
    };
  }

  $postLink() {
    this.$element.on("clickEvent", event => {
      this.eventValue = event.detail.value;

      this.$scope.$digest();
    });
  }
}
