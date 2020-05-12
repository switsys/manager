import orderPrivate from './order/private';
import orderPublic from './order/public';

import HostingDatabaseOrderPublic from './order/public/hosting-database-order-public.service';

import routing from './hosting-database.routing';

const moduleName = 'ovhManagerHostingDatabase';

angular
  .module(moduleName, [orderPrivate, orderPublic])
  .service('HostingDatabaseOrderPublicService', HostingDatabaseOrderPublic)
  .config(routing);

export default moduleName;
