/// <reference path="angular.min.js" />
var userdata = [];
var usermsgs = [];

var isUsersignedIn = false;

var presentUser = {
    id: "a000",
    firstname: "gray",
    lastname: "Price",
    email: "grayprice@sloganaut.com",
    phone: "+1 (901) 439-3220",
    location: "Layhill, North Carolina",
    username: "grayprice",
    password: "edebca"
};

var saveUserDataToLocalStorage = function () {

    window.localStorage['userData'] = angular.toJson(userdata);
    console.log("users saved to local storage : ");
    console.log(userdata);
};

var saveMsgsToLocalStorage = function () {
    window.localStorage['userMsgs'] = angular.toJson(usermsgs);
    console.log("Msgs save to local storage : ");
    console.log(usermsgs);
};

var loadUserDataFromLocalStorage = function () {
    userdata = JSON.parse(window.localStorage['userData']);
};

var loadUserMsgsFromLocalStorage = function () {
    usermsgs = JSON.parse(window.localStorage['userMsgs']);
};

var getUserIndex = function (usrname) {
    // returns the index of user with username , if user is not found -1 is returned
    

    for (var i = 0; i < userdata.length; i++) {
        if ((userdata[i].username) == (usrname))
            return i;
    }

    return -1;
};

var getUserDetails = function (userID) {
    var ret = {};

    for (var i = 0; i < userdata.length; i++) {
        if ((userdata[i].id) == (userID)) {
            ret.id = userdata[i].id;
            ret.email = userdata[i].email;
            ret.name = userdata[i].firstname + " " + userdata[i].lastname;
            return ret;
        }
            
    }

    return ret;
};

var gerUserIndexFrmEml = function (usrEml) {
    var ret = -1;

    for (var i = 0; i < userdata.length; i++) {
        if ((userdata[i].email) == (usrEml))
            return i;
    }

    return ret;
};

var setIndexToMsgArr = function () {
    
    for (var i = 0; i < usermsgs.length; i++) {
        usermsgs[i].indexToDelete = i;
    }
};

var removePresentUserFormLocalStorage = function () {
    localStorage.removeItem('presentUsr');
};

var savePresentuserToLocalStorage = function () {
    window.localStorage['presentUsr'] = angular.toJson(presentUser);
    console.log("present user save to local storage : ");
    console.log(presentUser);
};

var loadpresentFromLocalStorage = function () {
    if (localStorage.getItem('presentUsr') == null)
        return false;
    else {
        presentUser = JSON.parse(window.localStorage['presentUsr']);
        return true;
    }
};

window.onload = function () {
    console.log("program started;")
};

var app = angular.module("indexPage", ["ngRoute"])
    .config(function ($routeProvider) {
        $routeProvider
        .when("/", {
            templateUrl: "pages/signin.html",
            controller: "mainController"
        })
        .when("/signin", {
            templateUrl: "pages/signin.html"
        })
        .when("/signup", {
            templateUrl: "pages/signup.html"
        })
        .when("/profile", {
            templateUrl: "pages/profile.html"
        })
        .when("/inbox", {
            templateUrl: "pages/inbox.html"
        })
        .when("/sentMsgs", {
            templateUrl: "pages/sentMsgs.html"
        })
        .when("/logout", {
            templateUrl: "pages/logout.html"
        })
        .otherwise({
            templateUrl: "pages/signin.html"
        });

    })
    .controller("mainController", function ($scope, $location, $rootScope) {
        if (loadpresentFromLocalStorage()) {
            console.log("PageRefresh of url change detected : userProfile present in local storage redirecting to profilePage");
            $location.url("/profile");
            $rootScope.isSIgnedIn = true;
            loadUserDataFromLocalStorage();
            loadUserMsgsFromLocalStorage();
        }
        else {
            console.log("invalid url detected : moving to signin");
            $location.url("/signin");
            $rootScope.isSIgnedIn = false;
        }
    })
    .controller("signinController", function ($scope, $http, $location, $rootScope) {

        if (loadpresentFromLocalStorage()) {
            console.log("PageRefresh of url change detected : userProfile present in local storage redirecting to profilePage");
            $location.url("/profile");
            $rootScope.isSIgnedIn = true;
            loadUserDataFromLocalStorage();
            loadUserMsgsFromLocalStorage();
        }
        else {
            // console.log("invalid url detected : moving to signin");
            // $location.url("/signin");
            $rootScope.isSIgnedIn = false;
        }


        // sign in code goes here
        $scope.sup_signin = function () {
            console.log("Sign In button click triggered");
            $http.get("app-data/userData.json")
                .then(function (response) {
                    console.log("HTTP : read user data : ");
                    console.log(response.data);
                    
                    
                    if ((localStorage.getItem('userData')) === null) {
                        
                        console.log("data is not present in local storage");
                        // save data to local storage
                        userdata = response.data;
                        saveUserDataToLocalStorage();
                    }
                    else {

                        console.log("data is present in local storage ");

                        loadUserDataFromLocalStorage();
                        
                    }
                    

                    // get msgs and store in local storage
                    $http.get("app-data/msgData.json")
                    .then(function (response) {
                        console.log("HTTP : Reading all msgs ");

                        if ((localStorage.getItem('userMsgs')) === null) {
                            console.log("msgs is not present in local storage");
                            // save data to local storage
                            usermsgs = response.data;
                            saveMsgsToLocalStorage();
                        }
                        else {
                            console.log("msgs is present in local storage ");
                            loadUserMsgsFromLocalStorage();
                        }
                        
                        
                        // perform authentication now and check if user is valid
                        var usrIndex = getUserIndex($scope.sin_username);
                        if (usrIndex >= 0) {
                            console.log("User found ");
                            // checking for password
                            console.log("Org Pwd :" + userdata[usrIndex].password + ", Entered pwd : " + $scope.sin_password);
                            if (userdata[usrIndex].password == $scope.sin_password) {
                                console.log("user password accepted ... logging in");
                                
                                presentUser = userdata[usrIndex];
                                savePresentuserToLocalStorage();
                                $location.url("/profile");
                                $scope.sin_errmsg = "";
                                
                                isUsersignedIn = true;
                                $rootScope.isSIgnedIn = true;
                            }
                            else {
                                console.log("user entered wrong password please try again!!");
                                $scope.sin_errmsg = "Wrong Password entered!! Please Retry...";
                            }
                        }
                        else {
                            console.log("entered user not found");
                            $scope.sin_errmsg = "Username not found!! Please Retry...";
                        }
                
                    });
 
           });
        };

    })
    .controller("signupController", function ($scope, $location,$rootScope,$http) {

        if (loadpresentFromLocalStorage()) {
            console.log("PageRefresh of url change detected : userProfile present in local storage redirecting to profilePage");
            $location.url("/profile");
            $rootScope.isSIgnedIn = true;
            loadUserDataFromLocalStorage();
            loadUserMsgsFromLocalStorage();
        }
        else {
            console.log("invalid url detected : moving to signin");
            $location.url("/signup");
            $rootScope.isSIgnedIn = false;
        }











        $http.get("app-data/userData.json")
              .then(function (response) {
                  console.log("HTTP : read user data : ");
                  console.log(response.data);


                  if ((localStorage.getItem('userData')) === null) {

                      console.log("data is not present in local storage");
                      // save data to local storage
                      userdata = response.data;
                      saveUserDataToLocalStorage();
                  }
                  else {
                      console.log("data is present in local storage ");
                      loadUserDataFromLocalStorage();
                  }


                  // get msgs and store in local storage
                  $http.get("app-data/msgData.json")
                  .then(function (response) {
                      console.log("HTTP : Reading all msgs ");

                      if ((localStorage.getItem('userMsgs')) === null) {
                          console.log("msgs is not present in local storage");
                          // save data to local storage
                          usermsgs = response.data;
                          saveMsgsToLocalStorage();
                      }
                      else {
                          console.log("msgs is present in local storage ");
                          loadUserMsgsFromLocalStorage();
                      }

                  });
              });
                        
                        


























        // sign up code here 
        $scope.sup_create = function () {
            console.log("sign up button click triggered");

            if ((getUserIndex($scope.sup_username)) <= 0) {
                var newUsr = {
                    id: "a00" + userdata.length,
                    firstname: $scope.sup_firstname,
                    lastname: $scope.sup_lastname,
                    email: $scope.sup_email,
                    phone: $scope.sup_phone,
                    location: $scope.sup_location,
                    username: $scope.sup_username,
                    password: $scope.sup_password
                }
                console.log("user created : ");
                console.log(newUsr);
                userdata.push(newUsr);
                saveUserDataToLocalStorage();

            }
            else {
                // user name selected already exists
                alert("user name selected already exists");
                console.log("user name selected already exists");
            }

        };
    })
    .controller("profileController", function ($scope, $location, $rootScope) {
        console.log("profile controller triggered");
        
        $scope.editShow = true;

        if (loadpresentFromLocalStorage()) {
            // user is signed in and accessed profile 
            console.log("user is signed in and accessed profile page : access granted !!");
            $scope.user = presentUser;

            $scope.edt_username = presentUser.username;
            $scope.edt_password = presentUser.password;
            $scope.edt_firstname = presentUser.firstname;
            $scope.edt_lastname = presentUser.lastname;
            $scope.edt_email = presentUser.email;
            $scope.edt_phone = presentUser.phone;
            $scope.edt_location = presentUser.location;

        }
        else {
            // user is not signed in and tried to access profile page : redirect to sign in page
            console.log("user is not signed in and tried to access profile page : redirect to sign in page");
            $location.url("/signin");
            $rootScope.isSIgnedIn = false;
        }
        
        
        $scope.edt_create = function () {
            console.log("edit changes submit button trigerred");

            var indx = getUserIndex(presentUser.username);
            userdata[indx].username = "";

            if ((getUserIndex($scope.edt_username)) <= 0) {
                var edtUsr = {
                    id: presentUser.id,
                    firstname: $scope.edt_firstname,
                    lastname: $scope.edt_lastname,
                    email: $scope.edt_email,
                    phone: $scope.edt_phone,
                    location: $scope.edt_location,
                    username: $scope.edt_username,
                    password: $scope.edt_password
                }
                console.log("user edited : ");
                console.log(edtUsr);
                userdata[indx] = (edtUsr);
                presentUser = userdata[indx];
                $scope.user = presentUser;
                saveUserDataToLocalStorage();

                $scope.editShow = true;
            }
            else {
                // user name selected already exists
                alert("user name selected is taken by another user");
                console.log("user name selected is taken by another user");

                userdata[indx].username = presentUser.username;
            }


        };

    })
    .controller("inboxController", function ($scope) {
        console.log("inbox");



        if (loadpresentFromLocalStorage()) {
            // user is signed in and accessed profile 
            console.log("user is signed in and accessed profile page : access granted !!");
            $scope.user = presentUser;

            $scope.edt_username = presentUser.username;
            $scope.edt_password = presentUser.password;
            $scope.edt_firstname = presentUser.firstname;
            $scope.edt_lastname = presentUser.lastname;
            $scope.edt_email = presentUser.email;
            $scope.edt_phone = presentUser.phone;
            $scope.edt_location = presentUser.location;

        }
        else {
            // user is not signed in and tried to access profile page : redirect to sign in page
            console.log("user is not signed in and tried to access profile page : redirect to sign in page");
            $location.url("/signin");
            $rootScope.isSIgnedIn = false;
        }




        $scope.pUserID = presentUser.id;

        setIndexToMsgArr();
        $scope.msgs = usermsgs;

        $scope.senderName = function (usrId) {
            return (getUserDetails(usrId)).name;
        };

        $scope.senderEmail = function (usrId) {
            return (getUserDetails(usrId)).email;
        };

        $scope.composeNewMsg = function () {
            $scope.isComposeOpen = true;
        };
        $scope.composeReplyMsg = function (to, replyTitle, sid) {
            $scope.compToTextbox = to;
            $scope.compTitleTextBox = "RE : " + replyTitle;
            $scope.isComposeOpen = true;
            
        };
        $scope.composeFrwMsg = function (replyTitle, des, sid) {
            $scope.compTitleTextBox = "FWD : " + replyTitle;
            $scope.compDesTextBox = "FWD : " + des;
            $scope.isComposeOpen = true;
            
        };
        $scope.cancelCompose = function () {
            console.log("compose msg cancled!!")
            $scope.compToTextbox = "";
            $scope.compTitleTextBox = "";
            $scope.compDesTextBox = "";
            $scope.isComposeOpen = false;
        };
        $scope.composeSendMsg = function () {
            console.log("seng msg click event triggered");
            // find valid email
            var indx = gerUserIndexFrmEml($scope.compToTextbox);

            if (indx >= 0)  {
                // email is available
                console.log("sending msg to : " + $scope.compToTextbox);

                var msgg = usermsgs[0];
                msgg.sender_id = presentUser.id;
                msgg.receiver_id = userdata[indx].id;
                msgg.title = $scope.compTitleTextBox;
                msgg.msg = $scope.compDesTextBox;
                msgg.important = false;
                msgg.created_at = (new Date()).toString();
                
                console.log("sender msg : ");
                console.log(msgg);
                //push to msgs objects
                usermsgs.push(msgg);
                $scope.msgs = usermsgs;
                saveMsgsToLocalStorage();

                $scope.isComposeOpen = false;
                console.log("Msg Sent")
                $scope.compToTextbox = "";
                $scope.compTitleTextBox = "";
                $scope.compDesTextBox = "";
            }
            else {
                // email is not available
                console.log("Invalid email entered");
                alert("Enter valid email");
            }

        };

        $scope.impMarkEvent = function (i, isImportant) {
            console.log("msg[" + i + "].important changed to : " + (!isImportant));
            usermsgs[i].important = !isImportant;
            setIndexToMsgArr();
            $scope.msgs = usermsgs;
        };

        $scope.deleteMessage = function (tit, delIndex) {
            console.log("deleting msg : " + tit);
            setIndexToMsgArr();
            $scope.msgs = usermsgs;

            usermsgs.splice(delIndex, 1);

            saveMsgsToLocalStorage();
            setIndexToMsgArr();
            $scope.msgs = usermsgs;
        };

    })
    .controller("sentMsgsController", function ($scope) {

        if (loadpresentFromLocalStorage()) {
            // user is signed in and accessed profile 
            console.log("user is signed in and accessed profile page : access granted !!");
            $scope.user = presentUser;

            $scope.edt_username = presentUser.username;
            $scope.edt_password = presentUser.password;
            $scope.edt_firstname = presentUser.firstname;
            $scope.edt_lastname = presentUser.lastname;
            $scope.edt_email = presentUser.email;
            $scope.edt_phone = presentUser.phone;
            $scope.edt_location = presentUser.location;

        }
        else {
            // user is not signed in and tried to access profile page : redirect to sign in page
            console.log("user is not signed in and tried to access profile page : redirect to sign in page");
            $location.url("/signin");
            $rootScope.isSIgnedIn = false;
        }



        console.log("sentMsgsController");
        $scope.pUserID = presentUser.id;
        $scope.msgs = usermsgs;
        $scope.senderName = function (usrId) {
            return (getUserDetails(usrId)).name;
        };

        $scope.senderEmail = function (usrId) {
            return (getUserDetails(usrId)).email;
        };

        /*
        $scope.composeNewMsg = function () {
            $scope.isComposeOpen = true;
        };*/
        $scope.composeReplyMsg = function (to, replyTitle) {
            $scope.compToTextbox = to;
            $scope.compTitleTextBox = "RE : " + replyTitle;
            $scope.isComposeOpen = true;

        };
        $scope.composeFrwMsg = function (replyTitle, des, sid) {
            $scope.compTitleTextBox = "FWD : " + replyTitle;
            $scope.compDesTextBox = "FWD : " + des;
            $scope.isComposeOpen = true;

        };
        $scope.cancelCompose = function () {
            console.log("compose msg cancled!!")
            $scope.compToTextbox = "";
            $scope.compTitleTextBox = "";
            $scope.compDesTextBox = "";
            $scope.isComposeOpen = false;
        };
        $scope.composeSendMsg = function () {
            console.log("seng msg click event triggered");
            // find valid email
            var indx = gerUserIndexFrmEml($scope.compToTextbox);

            if (indx >= 0) {
                // email is available
                console.log("sending msg to : " + $scope.compToTextbox);

                var msgg = usermsgs[0];
                msgg.sender_id = presentUser.id;
                msgg.receiver_id = userdata[indx].id;
                msgg.title = $scope.compTitleTextBox;
                msgg.msg = $scope.compDesTextBox;
                msgg.important = false;
                msgg.created_at = (new Date()).toString();

                console.log("sender msg : ");
                console.log(msgg);
                // push to msgs objects
                usermsgs.push(msgg);
                $scope.msgs = usermsgs;
                saveMsgsToLocalStorage();

                $scope.isComposeOpen = false;
                console.log("Msg Sent")
                $scope.compToTextbox = "";
                $scope.compTitleTextBox = "";
                $scope.compDesTextBox = "";
            }
            else {
                // email is not available
                console.log("Invalid email entered");
                alert("Enter valid email");
            }

        };
        $scope.deleteMessage = function (tit, delIndex) {
            console.log("deleting msg : " + tit);
            setIndexToMsgArr();
            $scope.msgs = usermsgs;

            usermsgs.splice(delIndex, 1);

            saveMsgsToLocalStorage();
            setIndexToMsgArr();
            $scope.msgs = usermsgs;
        };

    })
    .controller("logoutController", function ($scope, $http, $location, $rootScope) {
        console.log("logout controller executed");

        $scope.clickYes = function () {
            console.log("logged out of messenger");
            $location.url("/signin");

            isUsersignedIn = false;
            $rootScope.isSIgnedIn = false;

            removePresentUserFormLocalStorage();

        };
        
        $scope.clickNo = function () {
            
            console.log("user rejected to log out");
            $location.url("/profile");
        };
        
    });

