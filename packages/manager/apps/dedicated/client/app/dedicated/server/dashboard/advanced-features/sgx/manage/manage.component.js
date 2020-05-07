import template from './manage.html';

export default {
  bindings: {
    activationMode: '<',
    activationModeValues: '<',
    biosSettinsSgx: '<',
    prmrr: '<',
    prmrrValues: '<',

    goBack: '<',
    goToConfirm: '<',
  },
  template,
  require: {
    dedicatedServer: '^dedicatedServer',
  },
};
