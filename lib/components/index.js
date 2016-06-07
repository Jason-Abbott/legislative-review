'use strict';

module.exports = {
	get viewLink() { return require('./view-link'); },
   get Footer() { return require('./footer'); },
   get Header() { return require('./header'); },
	get Login() { return require('./login'); },
   get Router() { return require('./router'); },
   get AccountMenu() { return require('./account-menu'); }
};