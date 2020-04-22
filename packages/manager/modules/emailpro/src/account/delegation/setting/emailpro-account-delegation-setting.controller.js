import angular from 'angular';

export default /* @ngInject */ function(
  $scope,
  EmailPro,
  $timeout,
  $translate,
) {
  const init = function init() {
    $scope.selectedAccount = $scope.currentActionData;
    $scope.form = { search: null };
  };

  const recordChangeOperations = function recordChangeOperations(
    account,
    buffer,
    changesList,
  ) {
    // records the operation for sendAs rights:
    if (account.sendAs !== buffer.sendAs) {
      changesList.sendRights.push({
        id: account.id,
        operation: account.sendAs === true ? 'POST' : 'DELETE',
      });
    }

    // records the operation for full access rights:
    if (account.fullAccess !== buffer.fullAccess) {
      changesList.fullAccessRights.push({
        id: account.id,
        operation: account.fullAccess === true ? 'POST' : 'DELETE',
      });
    }
    return changesList;
  };

  // Return an array containing changes compared to original configuration
  const getChanges = function getChanges() {
    const changesList = {
      account: $scope.selectedAccount.primaryEmailAddress,
      sendRights: [],
      fullAccessRights: [],
    };
    if ($scope.delegationList) {
      angular.forEach($scope.delegationList.list.results, (account, index) => {
        recordChangeOperations(
          account,
          $scope.bufferAccounts.list.results[index],
          changesList,
        );
      });
    }
    return changesList;
  };

  // Check if there are changes compared to original configuration
  $scope.hasChanged = function hasChanged() {
    const changesList = getChanges();
    if (changesList) {
      return (
        changesList.sendRights.length > 0 ||
        changesList.fullAccessRights.length > 0
      );
    }
    return false;
  };

  $scope.$watch(
    'form.search',
    (search) => {
      if ($scope.form.search !== null) {
        $timeout(() => {
          if ($scope.form.search === search) {
            $scope.$broadcast(
              'paginationServerSide.loadPage',
              1,
              'delegationTable',
            );
          }
        }, 1500);
      }
    },
    true,
  );

  $scope.updateDelegationRight = function updateDelegationRight() {
    $scope.resetAction();
    $scope.setMessage(
      $translate.instant('emailpro_ACTION_delegation_doing_message'),
    );

    EmailPro.updateDelegationRight(getChanges()).then(
      (data) => {
        $scope.setMessage(
          $translate.instant('emailpro_ACTION_delegation_success_message'),
          data,
        );
      },
      (failure) => {
        $scope.setMessage(
          $translate.instant('emailpro_ACTION_delegation_error_message'),
          failure.data,
        );
      },
    );
  };

  init();
}
