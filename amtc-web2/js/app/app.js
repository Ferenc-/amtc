/*
 * js/app.js - part of amtc-web, part of amtc
 * https://github.com/schnoddelbotz/amtc
 *
 * Use emberjs and ember-data to create our ambitious website.
 *
 * Bookmarks...
 *  http://emberjs.com/guides/concepts/naming-conventions/
 *  http://ember-addons.github.io/bootstrap-for-ember/
 */

var attr = DS.attr;
var hasMany = DS.hasMany;

// http://stackoverflow.com/questions/24222457
// /ember-data-embedded-records-current-state/24224682#24224682

var App = Ember.Application.create({
  //LOG_TRANSITIONS: true,
  // http://discuss.emberjs.com/t/equivalent-to-document-ready-for-ember/2766
  ready: function() {
    // turn off splash screen
    window.setTimeout( function(){
      if (App.readCookie("isLoggedIn")) {
        $('#splash').hide();
        $('#backdrop').hide();
      } else {
        $('#splash').fadeOut(1200);
        $('#backdrop').fadeOut(1000);
      }
    }, App.readCookie("isLoggedIn") ? 0 : 750);

    $(window).bind("load resize", function(){
      App.windowResizeHandler();
    });

    // AMTCWEB_IS_CONFIGURED gets defined via included script rest-api.php/rest-config.js
    if (typeof AMTCWEB_IS_CONFIGURED != 'undefined' && AMTCWEB_IS_CONFIGURED===false && !window.location.hash.match('#/page')) {
      // unconfigured system detected. inform user and relocate to setup.php
      humane.log('<i class="glyphicon glyphicon-fire"></i> '+
                 'No configuration file found!<br>warping into setup ...', { timeout: 3000 });
      window.setTimeout( function(){
        window.location.href = '#/setup'; // how to use transitionToRoute here?
      }, 3100);
    }

    // just for demo... we have a flashing bolt as progress indicator :-)
    window.setTimeout( function(){
      $('#bolt').removeClass('flash');
    }, 1500);
    // to trigger flash on ajax activity
    $(document).ajaxStart(function () {
      $('#bolt').addClass('flash');
    });
    // and to calm it down again when done
    $(document).ajaxStop(function () {
      $('#bolt').removeClass('flash');
    });
  },
  // for zero-padding numbers
  pad: function(number, length) {
    return (number+"").length >= length ?  number + "" : this.pad("0" + number, length);
  },
  // SB-Admin 2 responsiveness helper
  windowResizeHandler: function() {
    topOffset = 50;
    width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    if (width < 768) {
      $('div.navbar-collapse').addClass('collapse');
      topOffset = 100; // 2-row-menu
    } else {
      $('div.navbar-collapse').removeClass('collapse');
    }
    height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    height = height - topOffset;
    if (height < 1) height = 1;
    if (height > topOffset) {
      $("#page-wrapper").css("min-height", (height) + "px");
    }
  },
  // 1:1 copy, THANKS! https://github.com/joachimhs/Montric/blob/master/Montric.View/src/main/webapp/js/app.js
  createCookie: function(name, value, days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
  },
  readCookie:function (name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  eraseCookie:function (name) {
    this.createCookie(name, "", -1);
  }
});

// Routes

App.Router.map(function() {
  this.route('login');
  this.route('logout');
  this.route('setup');
  this.resource('logs');
  this.resource('energy');
  //this.resource('schedule');
  this.resource('page', { path: '/page/:id' });

  this.resource('ous', function() {
    this.route('new');
  });
  this.resource('ou', { path: '/ou/:id' }, function() {
    this.route('edit');
    this.route('hosts');
    this.route('monitor');
  });

  this.resource('users', function() {
    this.route('new');
  });
  this.resource('user', { path: '/user/:id' }, function() {
    this.route('edit');
  });

  this.resource('optionsets', function() {
    this.route('new');
  });
  this.resource('optionset', { path: '/optionset/:id' }, function() {
    this.route('edit');
  });

  this.resource('schedules', function() {
    this.route('new');
  });
  this.resource('schedule', { path: '/schedule/:id' }, function() {
    this.route('edit');
  });

});

Ember.Route.reopen({
  // http://stackoverflow.com/questions/13120474/emberjs-scroll-to-top-when-changing-view
  render: function(controller, model) {
    this._super();
    window.scrollTo(0, 0);
  },

  init: function() {
    // this will redirect any user arriving e.g. via bookmark -- without cookie.
    // done here, as ember-data routes would trigger errors without valid sess.
    var U = App.readCookie("username");
    var L = App.readCookie("isLoggedIn");
    if (U == null && L == null && !window.location.href.match('/login') && !window.location.href.match('/setup') && !window.location.href.match('/page')) {
      console.log('NULL USER detected on Ember.Route.init(); redir to #/login!');
      window.location.href = '#/login';
    }
    this._super();
  }
});
App.Router.reopen({
  routeDidChange: function() {
    // this will redirect any user that clicks on a link w/o having a cookie
    // console.log('AppRouter didTransition to: ' + url);
    var url = this.get('url')
    var U = App.readCookie("username");
    var L = App.readCookie("isLoggedIn");
    if (U == null && !url.match('/page') && !window.location.href.match('/setup')) {
      console.log('NULL USER detected on App.Router.routeDidChange(); redir to #/login!' + window.location.href);
      window.location.href = '#/login';
    }
  }.on('didTransition')
});

App.PageRoute = Ember.Route.extend({
  model: function(params) {
    console.log("PageRoute model() fetching single page");
    return this.store.find('page', params.id);
  }
});
App.OuRoute = Ember.Route.extend({
  model: function(params) {
    //console.log("App.OuRoute model(), find and set currentOU -> " + params.id);
    this.set('currentOU', params.id); // hmm, unneeded? better...how?
    return this.store.find('ou', params.id);
  },
});
App.OusRoute = Ember.Route.extend({
  model: function(params) {
    console.log("App.OusRoute model(), FETCH OUS");
    return this.store.find('ou');
  }
});
App.OusNewRoute = Ember.Route.extend({
  model: function() {
    console.log("OusNewRoute model() creating new OU");
    return this.store.createRecord('ou');
  }
});
App.LivestatesRoute = Ember.Route.extend({
  /// RETURN live powerstates via AMTC
});
App.LaststatesRoute = Ember.Route.extend({
  // RETURN last states via db view laststates (->table statelogs)
  model: function(params) {
    console.log("App.LaststatesRoute model(), fetch last state of pcs");
    return this.store.find('laststate');
  }
});
App.UserRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('user', params.id);
  },
});
App.UsersRoute = Ember.Route.extend({
  model: function() {
    console.log("UsersRoute model() fetching users");
    return this.store.find('user');
  }
});
App.UsersNewRoute = Ember.Route.extend({
  model: function() {
    console.log("UsersNewRoute model() creating new user");
    return this.store.createRecord('user');
  }
});
App.OptionsetRoute = Ember.Route.extend({
  model: function(params) {
    console.log("OptionsetRoute model() for id " + params.id);
    //this.set('currentOU', params.id); // hmm, unneeded? better...how?
    return this.store.find('optionset', params.id);
  },
});
App.OptionsetsRoute = Ember.Route.extend({
  model: function() {
    console.log("OptionsetsRoute model() fetching optionsets");
    return this.store.find('optionset');
  }
});
App.OptionsetsNewRoute = Ember.Route.extend({
  model: function() {
    console.log("OptionsetsNewRoute model() creating new optionset");
    return this.store.createRecord('optionset');
  }
});
App.NotificationsRoute = Ember.Route.extend({
  model: function() {
    console.log("NotificationsRoute model() fetching notifications");
    return this.store.find('notification');
  }
});
App.SetupRoute = Ember.Route.extend({
  setupController: function(controller,model) {
    console.log('ApplicationRoute setupController() triggering /phptests');
    this._super(controller,model);
      var p=this;
      $.ajax( { url: "rest-api.php/phptests", type: "GET" }).then(
        function(response) {
          var index;
          var supported = [];
          var a = response.phptests;
          var config_writable = false;
          var data_writable = false;
          var curl_supported = false;
          for (index = 0; index < a.length; ++index) {
              var e = a[index];
              (e.id=='pdo_sqlite') && (e.result==true) && supported.push('SQLite');
              (e.id=='pdo_mysql')  && (e.result==true) && supported.push('MySQL');
              (e.id=='pdo_pgsql')  && (e.result==true) && supported.push('PostgreSQL');
              (e.id=='pdo_oci')    && (e.result==true) && supported.push('Oracle');
              (e.id=='freshsetup') && (e.result==true) && controller.set('freshsetup', true);
              (e.id=='data')       && (e.result==true) && (data_writable = true);
              (e.id=='config')     && (e.result==true) && (config_writable = true);
              (e.id=='curl')       && (e.result==true) && (curl_supported = true);
          }
          controller.set('phptests', response.phptests);
          controller.set('authurl', response.authurl);
          controller.set('dbs', supported);
          controller.set('pdoSupported', supported.length>0 ? true : false);
          controller.set('preconditionsMet',
            (controller.get('pdoSupported') && controller.get('freshsetup') &&
               config_writable && data_writable && curl_supported) ? true : false);
        },
        function(response){
          humane.log('<i class="glyphicon glyphicon-fire"></i> Fatal error:'+
                     '<p>webserver seems to lack PHP support!</p>', { timeout: 0, clickToClose: true });
        }
      );
  }
});
App.SchedulesRoute = Ember.Route.extend({
  model: function() {
    console.log("SchedulesRoute model() fetching jobs with type=sched");
    return this.store.find('job');
  }
});
App.SchedulesNewRoute = Ember.Route.extend({
  model: function() {
    console.log("SchedulesNewRoute create record");
    return this.store.createRecord('job');
  }
});
App.ScheduleRoute = Ember.Route.extend({
  model: function(params) {
    console.log("SchedulesRoute model() fetching job with id=" + params.id);
    return this.store.find('job', params.id);
  }
});

// Views
/*
// http://emberjs.com/api/classes/Ember.View.html
MyView = Ember.View.extend({
  classNameBindings: ['propertyA', 'propertyB'],
  propertyA: 'from-a',
  propertyB: function() {
    if (someLogic) { return 'from-b'; }
  }.property()
});
*/

App.ApplicationView = Ember.View.extend({
  didInsertElement: function() {
    $('#side-menu').metisMenu(); // initialize metisMenu
    App.windowResizeHandler(); // ensure full height white body bg
  }
});
App.OuMonitorView = Ember.View.extend({
  tagName: '',
  classNames: ['row'],
  didInsertElement: function() {
    $("#livectrl").show();
    $("#hosts").show();
    $("#hosts").selectable({
      stop: function(){
        // trigger controller -- selection was modified
        var controller = App.__container__.lookup("controller:ouMonitor");
        controller.send('updateSelectedHosts');
      },
      filter: '.pc'
    });
    //
    var powerstates = {
      "pc":"any",       "S0":"on",        "S3":"sleep",
      "S4":"hibernate", "S5":"soft-off",  "S16":"no-reply",
      "ssh":"SSH",      "rdp":"RDP",      "none":"No-OS"
    };
    var osicons = {
      'SSH'     :'<i class="fa fa-fw fa-linux"></i> ',
      'RDP'     :'<i class="fa fa-fw fa-windows"></i> ',
      'soft-off':'<i class="fa fa-fw fa-power-off"></i> ',
      'No-OS'   :'<i class="fa fa-fw fa-ban red"></i> ',
    };
    //
    $("#hselect").html("");
    $.each(powerstates, function(key, value) {
      var icon = osicons[value] ? osicons[value] : '';
      $("#hselect").append('<div id="'+value+'" class="'+key+' pc">'+icon+value+'</div>');
      $("#"+value).click(function() {
        console.log('modifySelection ....');
        modifySelection(value,$(this).attr("class").split(' ')[0]);
      });
    });
    $("#hselect span").css( 'cursor', 'pointer' );
  },

  // fixme: only works when switching routes, but not for rooms
  willClearRender: function() {
    $("#livectrl").hide();
    $("#hosts").hide();
    $("#hosts").selectable("destroy");
    $(".pc").removeClass("ui-selected");
    var controller = App.__container__.lookup("controller:ouMonitor");
    controller.send('updateSelectedHosts');
  },


  roomSwitched: (function(){
    // http://madhatted.com/2013/6/8/lifecycle-hooks-in-ember-js-views
    Ember.run.scheduleOnce('afterRender', this, this.roomSwitchCleanup);
  }).observes('controller.hosts.@each'),

  roomSwitchCleanup: function(){
    $(".pc").removeClass("ui-selected");
    var controller = App.__container__.lookup("controller:ouMonitor");
    controller.send('updateSelectedHosts');
    $("#hselect span").removeClass("isActive");
  }
});
App.OuHostsView = Ember.View.extend({
  // add/remove hosts view
  didInsertElement: function() {
    console.log('OuHostsView making hosts selectable');
    $("#cfghosts").selectable({
      stop: function(){
        // trigger controller -- selection was modified
        //var controller = App.__container__.lookup("controller:ouHosts");
        //controller.send('updateSelectedHosts');
      },
      filter: '.pc'
    });
  }
});
App.IndexView = Ember.View.extend({
  templateName: 'index',
  didInsertElement: function() {

  // in sb-admin-2 demo, this came in via morris-data.js
  // should be retreived via REST in real life...
  Morris.Area({
    element: 'morris-area-chart',
    data: [{
        period: '2012-02-24 05:45',
        windows: 6,
        linux: null,
        unreachable: 2
    }, {
        period: '2012-02-24 06:00',
        windows: 13,
        linux: 4,
        unreachable: 4
    }, {
        period: '2012-02-24 06:15',
        windows: 20,
        linux: 7,
        unreachable: 3
    }, {
        period: '2012-02-24 06:30',
        windows: 54,
        linux: 12,
        unreachable: 14
    }, {
        period: '2012-02-24 06:45',
        windows: 112,
        linux: 27,
        unreachable: 4
    }, {
        period: '2012-02-24 07:00',
        windows: 140,
        linux: 57,
        unreachable: 3
    }, {
        period: '2012-02-24 07:15',
        windows: 70,
        linux: 90,
        unreachable: 70
    }, {
        period: '2012-02-24 07:30',
        windows: 140,
        linux: 110,
        unreachable: 0
    }, {
        period: '2012-02-24 07:45',
        windows: 120,
        linux: 80,
        unreachable: 0
    }, {
        period: '2012-02-24 08:00',
        windows: 120,
        linux: 67,
        unreachable: 13
    }],
    xkey: 'period',
    ykeys: ['linux', 'unreachable', 'windows'],
    labels: ['Linux', 'unreachable', 'Windows'],
    pointSize: 2,
    hideHover: 'auto',
    resize: true
    });
  }
});
App.NavigationView = Em.View.extend({
  templateName: 'navigation',
  selectedBinding: 'controller.selected',
  NavItemView: Ember.View.extend({
    tagName: 'li',
    classNameBindings: 'isActive:active'.w(),
    isActive: function() {
        return this.get('item') === this.get('parentView.selected');
    }.property('item', 'parentView.selected').cacheable()
  })
});
App.LoginView = Ember.View.extend({
  // that element has auto-focus, but it only works when entering route 1st time
  didInsertElement: function() {
    $('#username').focus();
  }
});

// Controllers
// see http://emberjs.com/guides/routing/generated-objects/
App.ApplicationController = Ember.Controller.extend({
  appName: 'amtc-web', // available as {{appName}} throughout app template
  needs: ["ou","ous","notifications","login"],

  // the initial value of the `search` property
  search: '',
  actions: {
    query: function() {
      // the current value of the text field
      var query = this.get('search');
      this.transitionToRoute('search', { query: query });
    },
    selectNode: function(node) {
      //console.log('TreeMenuComponent node: ' + node);
      this.set('selectedNode', node.get('id'));
      this.transitionToRoute('ou.monitor', node.get('id') )
    }

  },
});

App.LoginController = Ember.ObjectController.extend({
  needs: ["user"],

  isLoggingIn: false,
  isAuthenticated: false,
  uuidToken: null,
  authFailed: null,

  sessionid: null,
  username: null,
  password: null,

  init: function() {
    var cuser = App.readCookie("username");
    var isL = App.readCookie("isLoggedIn");
    this.set('username', cuser);
    this.set('isLoggedIn', isL);
    console.log('INIT UserCtrl with user ... ' + cuser);
  },

  isLoggedInObserver: function() {
    // third place to redirect users w/o login sess cookie
    console.log('Fetching user: ' + this.get('username'));
    if (this.get('username')) {
      this.set('content', this.store.find('user', this.get('username')));
    } else if (!window.location.href.match('/page')) {
      // redir to /login if non-/page (.md doc) request
      this.set('content', null);
      this.transitionToRoute('login');
    }
  }.observes('isLoggedIn').on('init'),

  actions: {
    doLogin: function(assertion) {
      this.set('isLoggingIn', true);
      var u = this.get('username');
      var p = this.get('password');
      var self = this;

      $.ajax({
        type: 'POST',
        url: 'rest-api.php/authenticate',
        data: {username: u, password: p},

        success: function(res, status, xhr) {
          console.log(res);
          if (res.exceptionMessage) {
            self.set('authFailed', true);
            $("#password").effect( "shake" );
          } else if (res.result=='success') {
            console.log('AUTH SUCCESS!');
            App.createCookie("username", u);
            App.createCookie("isLoggedIn", 1);
            self.set('isLoggingIn', false);
            self.set('password','no-longer-required');
            self.set('isAuthenticated', true);
            // self.transitionToRoute('index');
            // lazy way, retrigger ember-data loads...
            window.location.href = 'index.html';
          }
        },
        error: function(xhr, status, err) {
          console.log("error: " + status + " error: " + err);
        }
      });
    },
    doLogout: function() {
      //controller.set('content', null);
      this.set('isAuthenticated', false);
      $.ajax({
        type: 'GET',
        url: 'rest-api.php/logout',
        success: function(xhr, status, err) {
          console.log('onlogout: ');
          console.log(xhr);
          App.eraseCookie("amtcweb");
          App.eraseCookie("username");
          App.eraseCookie("isLoggedIn");
          humane.log('<i class="glyphicon glyphicon-fire"></i> Signed out successfully',
            { timeout: 1000, clickToClose: false });
          window.setTimeout( function(){
            window.location.href='index.html'; // not nice ... but ok 4 now
          }, 1100);
        },
        error: function(xhr, status, err) {
          console.log(xhr);
          console.log('Error while logging out: ' + err + " status: " + status);
        }
        });
    }
  },
});
App.LogoutController = Ember.ObjectController.extend({
  needs: ["user", "login"],
  init: function() {
    var cuser = App.readCookie("username");
    var isL = App.readCookie("isLoggedIn");
    console.log('LOGOUT UserCtrl with user ... ' + cuser);
    this.get('controllers.login').send('doLogout');
  },
});
// Index/Dashboard
App.IndexController = Ember.ObjectController.extend({
  needs: ["notifications","laststates"],
});
// Index page notification messages ('job completed') et al
App.NotificationsController = Ember.ArrayController.extend({
  notifications: function() {
    console.log("NotificationsController notifications() - fetching.");
    return this.get('store').find('notification');
  }.property()
});
// Users

// Organizational Units
App.UserEditController = Ember.ObjectController.extend({
  needs: ["ous"],

  actions: {
    removeUser: function () {
      if (confirm("Really delete this user?")) {
        console.log('FINALLY Remove it');
        var device = this.get('model');
        device.deleteRecord();
        device.save().then(function() {
          humane.log('<i class="glyphicon glyphicon-saved"></i> Deleted successfully',
            { timeout: 1500, clickToClose: false });
          console.log("FIXME - transtionToRoute doesnt work here...");
          window.location.href = '#/users';
        }, function(response){
          var res = jQuery.parseJSON(response.responseText);
          var msg = (typeof res.exceptionMessage=='undefined') ?
                    'Check console, please.' : res.exceptionMessage;
          humane.log('<i class="glyphicon glyphicon-fire"></i> Ooops! Fatal error:'+
                     '<p>'+msg+'</p>', { timeout: 0, clickToClose: true });
        }
      )};
    },

    doneEditingReturn: function() {
      console.log(this.get('model'));
      this.get('model').save().then(function() {
        humane.log('<i class="glyphicon glyphicon-saved"></i> Saved successfully',
          { timeout: 800 });
        window.location.href = '#/users';
      }, function(response){
        var res = jQuery.parseJSON(response.responseText);
        var msg = (typeof res.exceptionMessage=='undefined') ?
                   'Check console, please.' : res.exceptionMessage;
        humane.log('<i class="glyphicon glyphicon-fire"></i> Ooops! Fatal error:'+
                   '<p>'+msg+'</p>', { timeout: 0, clickToClose: true });
        device.rollback();
        }
      );
    }
  }

});
App.UsersNewController = App.UserEditController;
// Organizational Units
App.OuController = Ember.ObjectController.extend({
  needs: ["optionsets","ous"],
  currentOU: null,
  isEditing: false,
  ouTree: null,
});
App.OuEditController = Ember.ObjectController.extend({
  needs: ["optionsets","ous"],
  actions: {
    removeOu: function () {
      if (confirm("Really delete this OU?")) {
        console.log('FINALLY Remove it' + this.get('controllers.ous.ous'));
        var device = this.get('model');
        console.log("DEV id: "+device.id);
        console.log("DEL: "+device.get('isDeleted'));
        device.deleteRecord();
        console.log("DEL: "+device.get('isDeleted'));

        device.save().then(function(x) {
          console.log('DELETE SUCCESS');
          humane.log('<i class="glyphicon glyphicon-saved"></i> Deleted successfully',
            { timeout: 1500, clickToClose: false });
          console.log("FIXME - transtionToRoute doesnt work here...");
          window.location.href = '#/ous';
        }, function(response){
          var res = jQuery.parseJSON(response.responseText);
          var msg = (typeof res.exceptionMessage=='undefined') ?
                    'Check console, please.' : res.exceptionMessage;
          humane.log('<i class="glyphicon glyphicon-fire"></i> Ooops! Fatal error:'+
                     '<p>'+msg+'</p>', { timeout: 0, clickToClose: true });
          device.rollback();
        });
      }
    },

    edit: function() {
      this.set('isEditing', true);
    },

    doneEditingReturn: function() {
      this.set('isEditing', false);
      this.get('model').save().then(function() {
        humane.log('<i class="glyphicon glyphicon-saved"></i> Saved successfully',
            { timeout: 800 });
        window.location.href = '#/ous';
      }, function(response){
          var res = jQuery.parseJSON(response.responseText);
          var msg = (typeof res.exceptionMessage=='undefined') ?
                    'Check console, please.' : res.exceptionMessage;
          humane.log('<i class="glyphicon glyphicon-fire"></i> Ooops! Fatal error:'+
                     '<p>'+msg+'</p>', { timeout: 0, clickToClose: true });
      } );
    }
  }
});
App.OusController = Ember.ArrayController.extend({
  ous: function() {
    console.log("OusController ous() - fetching.");
    return this.get('store').find('ou');
  }.property()
});
App.OusIndexController = Ember.ObjectController.extend({
  needs: ["ous","optionsets"],
  // needs: ['application'],
  // currentUser: Ember.computed.alias('controllers.application.currentUser'),
  //  addPost: function() {
  //  console.log('Adding a post for ', this.get('currentUser.name'));
  // }
});
App.OusNewController = App.OuEditController; // FIXME: evil?
// Client PCs
App.HostsController = Ember.ArrayController.extend({
  hosts: function() {
    console.log("HostsController hosts() - fetching.");
    return this.get('store').find('host');
  }.property()
});
App.OuHostsController = Ember.ObjectController.extend({
  needs: ["hosts"],
  addMultiple: false,
  numHosts: 5,
  startNum: 20,
  padNum:3,
  hostname: null,
  domainName: null,

  hostsToAdd: function() {
    if (!this.get('addMultiple')) {
      return [this.get('hostname')];
    } else {
      var hosts = [];
      if (this.get('numHosts') < 1)
       return hosts;

      var start = this.get('startNum');
      var stop  = parseInt(this.get('startNum')) + parseInt(this.get('numHosts')) - 1;
      for (var x=start; x<=stop; x++) {
        var hostname = this.get('hostname') +
                       App.pad( x, this.get('padNum')) +
                       (this.get('domainName') ? ('.' + this.get('domainName')) : '');
        hosts.push(hostname);
      }
      return hosts;
    }
  }.property('hostname','numHosts','domainName','padNum','startNum','addMultiple'),

  actions: {
    saveNewHosts: function() {
      var ouid = this.get('id');
      //var ou = this.store.find('ou', ouid); // async
      var ou = this.store.getById('ou', ouid); // https://github.com/emberjs/data/issues/2150
      var add = this.get('hostsToAdd');
      var idx;
      for (idx=0; idx<add.length; idx++) {
        var host = add[idx];
        var record = this.store.createRecord('host');
        record.set('hostname', host);
        record.set('ou_id', ou);
        record.save(); // .then()
        this.set('numHosts', (this.get('numHosts')-1));
      }
    }
  }
});
App.OuMonitorController = Ember.ObjectController.extend({
  needs: ["hosts","ous","laststates"],

  selectedAction: null,
  selectedHosts: {},
  selectedHostsCount: 0,

  laststates: Ember.computed.alias("controllers.laststates"),

  actions: {
    updateSelectedHosts: function() {
      this.set('selectedHosts', $('#hosts .ui-selected'));
      this.set('selectedHostsCount', $(".ui-selected").length);
    },
    setActionPowerup:    function() { this.set('selectedAction', 'U'); },
    setActionPowerdown:  function() { this.set('selectedAction', 'D'); },
    setActionReset:      function() { this.set('selectedAction', 'R'); },
    setActionPowercycle: function() { this.set('selectedAction', 'C'); },
  }
});
App.LaststatesController = Ember.ArrayController.extend({
  laststates: function() {
    console.log("laststatesController laststates() - fetching.");
    return this.get('store').find('laststate');
  }.property(),

  stateSSH: function() {
    var laststates = this.get('laststates');
    return laststates.filterBy('open_port', 22).get('length');
  }.property('laststates.@each.open_port'),

  stateRDP: function() {
    var laststates = this.get('laststates');
    return laststates.filterBy('open_port', 3389).get('length');
  }.property('laststates.@each.open_port'),

  stateOff: function() {
    var laststates = this.get('laststates');
    return laststates.filterBy('state_amt', 5).get('length');
  }.property('laststates.@each.state_amt'),

  stateUnreachable: function() {
    var laststates = this.get('laststates');
    return laststates.filterBy('state_http', 0).get('length');
  }.property('laststates.@each.state_http'),

});
// AMT Optionsets
App.OptionsetController = Ember.ObjectController.extend({
  needs: ["optionsets"],
  currentOU: null,
  isEditing: false,
  ouTree: null,

  actions: {
    removeOptionset: function () {
      if (confirm("Really delete this optionset?")) {
        console.log('FINALLY Remove it');
        var device = this.get('model');
        device.deleteRecord();
        device.save().then(function() {
          humane.log('<i class="glyphicon glyphicon-saved"></i> Deleted successfully',
            { timeout: 1500, clickToClose: false });
          console.log("FIXME - transtionToRoute doesnt work here...");
          window.location.href = '#/optionsets';
        }, function(response){
          var res = jQuery.parseJSON(response.responseText);
          var msg = (typeof res.exceptionMessage=='undefined') ?
                    'Check console, please.' : res.exceptionMessage;
          humane.log('<i class="glyphicon glyphicon-fire"></i> Ooops! Fatal error:'+
                     '<p>'+msg+'</p>', { timeout: 0, clickToClose: true });
        }
      )};
    },

    doneEditingReturn: function() {
      this.set('isEditing', false);
      console.log(this.get('model'));
      this.get('model').save().then(function() {
        humane.log('<i class="glyphicon glyphicon-saved"></i> Saved successfully',
          { timeout: 800 });
        window.location.href = '#/optionsets';
      }, function(response){
        var res = jQuery.parseJSON(response.responseText);
        var msg = (typeof res.exceptionMessage=='undefined') ?
                   'Check console, please.' : res.exceptionMessage;
        humane.log('<i class="glyphicon glyphicon-fire"></i> Ooops! Fatal error:'+
                   '<p>'+msg+'</p>', { timeout: 0, clickToClose: true });
        }
      );
    }
  }
});
App.OptionsetsNewController = App.OptionsetController; // FIXME: evil?
App.OptionsetsController = Ember.ArrayController.extend({
  optionsets: function() {
    return this.get('store').find('optionset');
  }.property()
});
// Scheduled Tasks
App.ScheduleController = Ember.ObjectController.extend({
  needs: ["ous"],
  currentOU: null,
  isEditing: false,
  ouTree: null,

  actions: {
    removeSchedule: function () {
      if (confirm("Really delete this job?")) {
        console.log('FINALLY Remove it');
        var device = this.get('model');
        device.deleteRecord();
        device.save().then(function() {
          humane.log('<i class="glyphicon glyphicon-saved"></i> Deleted successfully',
            { timeout: 1500, clickToClose: false });
          console.log("FIXME - transtionToRoute doesnt work here...");
          window.location.href = '#/schedules';
        }, function(response){
          var res = jQuery.parseJSON(response.responseText);
          var msg = (typeof res.exceptionMessage=='undefined') ?
                    'Check console, please.' : res.exceptionMessage;
          humane.log('<i class="glyphicon glyphicon-fire"></i> Ooops! Fatal error:'+
                     '<p>'+msg+'</p>', { timeout: 0, clickToClose: true });
        }
      )};
    },

    doneEditingReturn: function() {
      this.set('isEditing', false);
      //console.log(this.get('model'));
      this.get('model').save().then(function() {
        humane.log('<i class="glyphicon glyphicon-saved"></i> Saved successfully',
          { timeout: 800 });
        window.location.href = '#/schedules';
      }, function(response){
        var res = jQuery.parseJSON(response.responseText);
        var msg = (typeof res.exceptionMessage=='undefined') ?
                   'Check console, please.' : res.exceptionMessage;
        humane.log('<i class="glyphicon glyphicon-fire"></i> Ooops! Fatal error:'+
                   '<p>'+msg+'</p>', { timeout: 0, clickToClose: true });
        }
      );
    }
  }
});
App.SchedulesNewController = App.ScheduleController; // FIXME: evil? dumb...?
// Controller for /#setup (Installer)
App.SetupController = Ember.ObjectController.extend({
  // Controller used for initial installation page #setup
  selectedDB: null,
  sqlitePath: 'data/amtc-web.db',
  timezone: 'Europe/Berlin',
  mysqlUser: 'amtcweb',
  mysqlHost: 'localhost',
  mysqlPassword: null,
  mysqlDB: 'amtc',
  importDemo: true,
  installHtaccess: null,
  phptests: null,
  freshsetup: false,
  datadir: 'data',
  preconditionsMet: false,
  amtcbin: '/usr/bin/amtc',

  dbs: null, // Array of supported DBs; gets set in SetupRoute
  pdoSupported: false,
  authurl: null,

  isMySQL: function() {
    return (this.get('selectedDB')=='MySQL') ? true : false;
  }.property('selectedDB'),
  isSQLite: function() {
    return (this.get('selectedDB')=='SQLite') ? true : false;
  }.property('selectedDB'),
  isOracle: function() {
    return (this.get('selectedDB')=='Oracle') ? true : false;
  }.property('selectedDB'),
  isPostgreSQL: function() {
    return (this.get('selectedDB')=='PostgreSQL') ? true : false;
  }.property('selectedDB'),

  doneEditing: function() {
    var d = {
      datadir: this.get('datadir'),
      timezone: this.get('timezone'),
      selectedDB: this.get('selectedDB'),
      sqlitePath: this.get('sqlitePath'),
      mysqlUser: this.get('mysqlUser'),
      mysqlHost: this.get('mysqlHost'),
      mysqlPassword: this.get('mysqlPassword'),
      mysqlDB: this.get('mysqlDB'),
      amtcbin: this.get('amtcbin'),
      authurl: this.get('authurl'),
      importDemo: this.get('importDemo'),
      installHtaccess: this.get('installHtaccess'),
    };
    $.ajax({type:"POST", url:"rest-api.php/submit-configuration",
            data:jQuery.param(d), dataType:"json"}).then(function(response) {
      console.log(response);
      if (typeof response.errorMsg != "undefined")
        humane.log('<i class="glyphicon glyphicon-fire"></i> Save failed: <br>'+response.errorMsg, { timeout: 0, clickToClose: true, addnCls: 'humane-error'});
      else {
        humane.log('<i class="glyphicon glyphicon-saved"></i> Saved successfully! Warping into amtc-web!', { timeout: 1500 });
        window.setTimeout( function(){
          window.location.href = 'index.html';
        }, 2000);
      }
    }, function(response){
      console.log("what happened?");
      console.log(response);
      if (response.responseText=='INSTALLTOOL_LOCKED') {
        humane.log('<i class="glyphicon glyphicon-fire"></i> Setup is LOCKED!<br>'+
          'Setup is intended for initial installation only.<br>'+
          'Remove <code>config/siteconfig.php</code> to re-enable setup.',
          { timeout: 0, clickToClose: true, addnCls: 'humane-error' });
      } else {
        humane.log('<i class="glyphicon glyphicon-fire"></i> Failed to save! Please check console.'+response.responseText,
          { timeout: 0, clickToClose: true, addnCls: 'humane-error' });
      }
    });
  }
});

// Models

// Organizational Unit
App.Ou = DS.Model.extend({
  name: attr('string'),
  description: attr('string'),
  parent_id: DS.belongsTo('ou', {inverse: 'children'}),
  optionset_id: DS.belongsTo('optionset'),
  ou_path: attr('string'),
  idle_power: attr('number'),
  logging: attr('boolean'),
  children: DS.hasMany('ou', {inverse: 'parent_id'}),
  hosts: DS.hasMany('host'),//, {inverse: null}),

  /// FIXME FIXME ... still feels hackish, but makes the dropdown+save work...
  optionsetid: function(key,value) {
    if (value) {
       //this.set('optionset_id',value);
      return value;
    }
    else {
      console.log('get optionset -> ' + this.get('optionset_id.id'));
      return this.get('optionset_id');
    }
  }.property('optionset_id'),

  // new ou-tree; 1:1 from https://github.com/joachimhs/Montric/blob/master/Montric.View/src/main/webapp/js/app/models/MainMenuModel.js
  isSelected: false,
  isExpanded: true, // make this user/cookie/whatever optional
  isRootLevel: function() {
    return this.get('parent_id.id')==1 ? true : false; /// OH SOOOO HACKISH
  }.property('children').cacheable(),
  hasChildren: function() {
    return this.get('children').get('length') > 0;
  }.property('children').cacheable(),
  isLeaf: function() {
    return this.get('children').get('length') == 0;
  }.property('children').cacheable(),
  isExpandedObserver: function() {
    //console.log('isExpanded: ' + this.get('id'));
    if (this.get('isExpanded')) {
      var children = this.get('children.content');
      if (children) {
        //console.log('Sorting children');
        //children.sort(App.Ou.compareNodes);
      }
    }
  }.observes('isExpanded')
});
App.Ou.reopenClass({
  compareNodes: function(nodeOne, nodeTwo) {
    if (nodeOne.get('id') > nodeTwo.get('id'))
        return 1;
    if (nodeOne.get('id') < nodeTwo.get('id'))
        return -1;
    return 0;
  }
});
// Clients/Hosts
App.Host = DS.Model.extend({
  ou_id: DS.belongsTo('ou', {async:false}),//, {inverse: null}),
  hostname: attr('string'),
  enabled: attr('boolean'),
  laststate: DS.belongsTo('laststate'),
  // add isSelected et al
});
// Markdown help / documentation pages
App.Page = DS.Model.extend({
  page_name: attr('string'),
  page_title: attr('string'),
  page_content: attr('string'),
});
// Notification center messages
App.Notification = DS.Model.extend({
  ntype: attr('string'),
  tstamp: attr('string'),
  user_id: DS.belongsTo('user'),
  message: attr('string'),
  cssClass: function(key,value) {
    if (!value) {
      var cc = "fa fa-"+this.get('ntype')+" fa-fw";
      return cc;
    }
  }.property('ntype')
});
// AMT Option sets
App.Optionset = DS.Model.extend({
  name: attr('string'),
  description: attr('string'),
  sw_dash: attr('boolean'),
  sw_v5: attr('boolean'),
  sw_scan22: attr('boolean'),
  sw_scan3389: attr('boolean'),
  sw_usetls: attr('boolean'),
  sw_skipcertchk: attr('boolean'),
  opt_maxthreads: attr('string'),
  opt_timeout: attr('string'),
  opt_passfile: attr('string'),
  opt_cacertfile: attr('string')
});
// Users
App.User = DS.Model.extend({
  ou_id: DS.belongsTo('ou'),
  name: attr('string'),
  fullname: attr('string'),
  is_enabled: attr('boolean'),
  is_admin: attr('boolean'),
  can_control: attr('boolean')
});
// Last power states
App.Laststate = DS.Model.extend({
  host_id: DS.belongsTo('host'),
  state_begin: attr('number'),
  open_port: attr('number'),
  state_amt: attr('number'),
  state_http: attr('number'),

  lastScan: function() {
    return moment.unix(this.get('state_begin')).fromNow();
  }.property('state_begin'),
  openPortIcon: function() {
    var cc='fa fa-ban fa-fw';
    this.get('state_http')== 200  && this.get('state_amt')==0 && (cc='fa fa-ban fa-fw red'); // AMT ok, powered up, no OS
    this.get('state_http')== 200  && this.get('state_amt')==5 && (cc='fa fa-power-off fa-fw'); // AMT ok, powered down
    this.get('open_port') == 22   && (cc = "fa fa-linux fa-fw");
    this.get('open_port') == 3389 && (cc = "fa fa-windows fa-fw");
    return new Handlebars.SafeString('<i class="'+cc+'"></i> ');
  }.property('open_port','state_http','state_amt'),
  openPortCssClass: function() {
    var result = ''; // unreachable
    switch(this.get('open_port')) {
    case 22:
        result = 'ssh';
        break;
    case 3389:
        result = 'rdp';
        break;
    default:
        this.get('state_http')==200 && this.get('state_amt')==0 && (result = 'none'); // AMT reachable, ON, but no OS
    }
    return result;
  }.property('open_port','state_http','state_amt'),
  amtStateCssClass: function() {
    return 'S' + this.get('state_amt');
  }.property('state_amt'),
});
// Jobs / scheduled tasks
App.Job = DS.Model.extend({
  ou_id: DS.belongsTo('ou', {async:false}),//, {inverse: null}),
  job_type: attr('number'), // 1=interactive, 2=scheduled, 3=monitor
  description: attr('string'),
  start_time: attr('number'),
  amtc_cmd: attr('string'),
  amtc_delay: attr('number'),
  repeat_interval: attr('number'),
  repeat_days: attr('number'),
  last_started: attr('number'),
  last_done: attr('number'),

  // start_time is a int value representing minute-of-day.
  // allow getting / setting it in a human readable form.
  human_start_time: function(k,v) {
    if (arguments.length > 1) {
      var parts =  v.split(':');
      var h = parseInt(parts[0]);
      var m = parseInt(parts[1]);
      var hm = h*60 + m;
      this.set('start_time', hm);
    }
    var hrs = App.pad( Math.floor(this.get('start_time')/60),  2);
    var min = App.pad( this.get('start_time') - ( hrs * 60),  2);
    return hrs + ':' + min;
  }.property('start_time'),

  // repeat_days is a bitmask, starting with sunday=1.
  // setters on computable properties below provide easy access...
  on_sunday: function(k,v) {
    if (arguments.length > 1)
      this.set('repeat_days', this.get('repeat_days') ^ 1);
    return this.get('repeat_days') & 1 ? true : false;
  }.property('repeat_days'),
  on_monday: function(k,v) {
    if (arguments.length > 1)
      this.set('repeat_days', this.get('repeat_days') ^ 2);
    return this.get('repeat_days') & 2 ? true : false;
  }.property('repeat_days'),
  on_tuesday: function(k,v) {
    if (arguments.length > 1)
      this.set('repeat_days', this.get('repeat_days') ^ 4);
    return this.get('repeat_days') & 4 ? true : false;
  }.property('repeat_days'),
  on_wednesday: function(k,v) {
    if (arguments.length > 1)
      this.set('repeat_days', this.get('repeat_days') ^ 8);
    return this.get('repeat_days') & 8 ? true : false;
  }.property('repeat_days'),
  on_thursday: function(k,v) {
    if (arguments.length > 1)
      this.set('repeat_days', this.get('repeat_days') ^ 16);
    return this.get('repeat_days') & 16 ? true : false;
  }.property('repeat_days'),
  on_friday: function(k,v) {
    if (arguments.length > 1)
      this.set('repeat_days', this.get('repeat_days') ^ 32);
    return this.get('repeat_days') & 32 ? true : false;
  }.property('repeat_days'),
  on_saturday: function(k,v) {
    if (arguments.length > 1)
      this.set('repeat_days', this.get('repeat_days') ^ 64);
    return this.get('repeat_days') & 64 ? true : false;
  }.property('repeat_days'),

  isInteractiveTask: function() { return this.get('job_type')==1; }.property('job_type'),
  isScheduledTask:   function() { return this.get('job_type')==2; }.property('job_type'),
  isMonitoringTask:  function() { return this.get('job_type')==3; }.property('job_type')
});

// Components (menu tree...)

App.TreeMenuNodeComponent = Ember.Component.extend({
  classNames: ['pointer','nav'],
  tagName: 'li',
  actions: {
    toggleExpanded: function() {
      this.toggleProperty('node.isExpanded');
    },
    toggleSelected: function() {
      this.toggleProperty('node.isSelected');
    },
    selectNode: function(node) {
      //console.log('selectedNode: ' + node);
      this.sendAction('action', node);
    }
  },
  isSelected: function() {
    //console.log("'" + this.get('selectedNode') + "' :: '" + this.get('node.id') + "'");
    return this.get('selectedNode') === this.get('node.id');
  }.property('selectedNode', 'node.id')
});

// Handlebars helpers

// markdown to html conversion
var showdown = new Showdown.converter();
Ember.Handlebars.helper('format-markdown', function(input) {
  if (input) {
    var md = showdown.makeHtml(input);
    md = md.replace("<h1 id=",'<h1 class="page-header" id=');
    var html = new Handlebars.SafeString(md);
    return html;
  } else {
    console.log("Warning: empty input on showdown call.");
    return input;
  }
});

// print fontAwesome checkmarks for input true/false
Ember.Handlebars.helper('check-mark', function(input) {
  return input ?
    new Handlebars.SafeString('<i class="fa grey fa-fw fa-check-square-o"></i> ') :
    new Handlebars.SafeString('<i class="fa grey fa-fw fa-square-o"></i> ');
});

// moment.js PRETTY timestamps
Ember.Handlebars.helper('format-from-now', function(date) {
  return moment.unix(date).fromNow();
});


// Further helpers


// Legacy amtc-web1 needs-cleanup-stuff

//// FIXME
/* called when group-by-powerstate-selection is done. */
function modifySelection(buttonid, pclass) {
  if ($("#"+buttonid).hasClass("isActive")) {
    $("#hosts ."+pclass).removeClass("ui-selected");
    $("#"+buttonid).removeClass("isActive");
    if (buttonid=="any") {
      $("#hosts .pc").removeClass("ui-selected");
      $("#hselect span").removeClass("isActive");
    }
  } else {
    $("#hosts ."+pclass).addClass("ui-selected");
    $("#"+buttonid).addClass("isActive");
  }
  //updatePowerController();
  var controller = App.__container__.lookup("controller:ouMonitor");
  controller.send('updateSelectedHosts')
}
/////// FIXME
