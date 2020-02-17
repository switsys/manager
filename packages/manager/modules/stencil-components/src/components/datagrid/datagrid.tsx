import isFunction from "lodash/isFunction";

import { Component, Prop, Host, h } from "@stencil/core";

@Component({
  tag: "sc-datagrid",
  styleUrl: "datagrid.css",
  shadow: true
})
export class Datagrid {
  @Prop() providedData = [];

  @Prop() getData: Function;

  componentWillRender() {
    debugger;
    if (isFunction(this.getData)) {
      this.providedData = this.getData();
    }
  }

  render() {
    const [firstItem] = this.providedData;
    const firstItemKeys = firstItem ? Object.keys(firstItem) : [];

    return (
      <Host>
        <section>
          <h3>SIP Endpoints</h3>
          <table>
            {firstItemKeys.map(key => {
              return <th>{key}</th>;
            })}
            {this.providedData.map(item => {
              return (
                <tr>
                  {Object.values(item).map(val => {
                    return <span>{val}</span>;
                  })}
                </tr>
              );
            })}
          </table>
        </section>
      </Host>
    );
  }
}
//
// <section>
//   <h3 data-translate="carrier_sip_endpoints"></h3>
//   <oui-datagrid data-rows="$ctrl.endpoints">
//     <oui-column
//       data-title=":: 'carrier_sip_endpoints_id' | translate"
//       data-property="id"
//     ></oui-column>
//     <oui-column
//       data-title=":: 'carrier_sip_endpoints_protocol' | translate"
//       data-property="protocol"
//     >
//       <span data-translate="{{:: 'carrier_sip_endpoints_protocol_' + $row.protocol }}"></span>
//     </oui-column>
//     <oui-column
//       data-title=":: 'carrier_sip_endpoints_ip_sip' | translate"
//       data-property="ip"
//     ></oui-column>
//     <oui-column
//       data-title=":: 'carrier_sip_endpoints_port' | translate"
//       data-property="port"
//     ></oui-column>
//     <oui-column
//       data-title=":: 'carrier_sip_endpoints_priority' | translate"
//       data-property="priority"
//     ></oui-column>
//     <oui-column
//       data-title=":: 'carrier_sip_endpoints_weight' | translate"
//       data-property="weight"
//     ></oui-column>
//   </oui-datagrid>
// </section>;
