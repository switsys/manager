import Postmate from 'postmate';
import messages from './constants';

const handshake = new Postmate.Model({
  updateHash: (hash) => {
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  },
});

handshake.then((parent) => {
  window.addEventListener('hashchange', () => {
    parent.emit(messages.hashChange, window.location.hash);
  });
});

const api = {
  login: (url) =>
    handshake.then((parent) => {
      parent.emit(messages.login, url);
    }),
  logout: () =>
    handshake.then((parent) => {
      parent.emit(messages.logout);
    }),
  sessionSwitch: () =>
    handshake.then((parent) => {
      parent.emit(messages.sessionSwitch);
    }),
};

export { api, messages };
