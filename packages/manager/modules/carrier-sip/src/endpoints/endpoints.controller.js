export default class {
  $onInit() {
    debugger;
    this.providedData = [
      { id: 0, firstName: 'Jérémy', lastName: 'DE CESARE' },
      { id: 1, firstName: 'Frédéric', lastName: 'ESPIAU' },
      { id: 2, firstName: 'Axel', lastName: 'PETER' },
      { id: 3, firstName: 'Cyrille', lastName: 'BOURGOIS' },
    ];

    const scDatagrid = document.querySelector('#endpointDatagrid');
    scDatagrid.providedData = this.providedData;
  }
}
