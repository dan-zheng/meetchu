webpackJsonp([1],[,,,,,,,,,,,,,,,,function(e,t,a){e.exports=a.p+"static/img/meetchu.fee8fc2.svg"},function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var s=a(3),o=a(18),n=a.n(o),r=a(80),l=a.n(r),i=a(100),c=a.n(i),u=a(81),d=a.n(u),m=a(53),f=a(36),v=a(37),p=a(82),g=a.n(p);s.a.use(l.a,n.a),s.a.use(c.a),s.a.use(d.a),s.a.use(m.a);var b=a.i({NODE_ENV:"production"}).PORT||3e3;s.a.axios.defaults.baseURL="http://localhost:"+b,s.a.axios.defaults.headers.common["Access-Control-Allow-Origin"]="*",s.a.config.productionTip=!1,new s.a({el:"#app",store:v.a,router:f.a,template:"<App/>",components:{App:g.a}})},,,,,,,,,,,,,,,,,,,function(e,t,a){"use strict";var s=a(3),o=a(101),n=a(86),r=a.n(n),l=a(84),i=a.n(l),c=a(85),u=a.n(c),d=a(87),m=a.n(d),f=a(83),v=a.n(f),p=a(88);a.n(p);s.a.use(o.a),t.a=new o.a({mode:"history",routes:[{path:"/",component:r.a,children:[{path:"",component:i.a},{path:"login",component:u.a,meta:{auth:!1}},{path:"signup",component:m.a,meta:{auth:!1}},{path:"dashboard",component:v.a,meta:{auth:!0}}]}],beforeEach:function(e,t,a){e.matched.some(function(e){return e.meta.auth})?auth.loggedIn()?a():a({path:"/login",query:{redirect:e.fullPath}}):a()}})},function(e,t,a){"use strict";var s=a(3),o=a(103),n=a(38);s.a.use(o.a),t.a=new o.a.Store({modules:{auth:n.a}})},function(e,t,a){"use strict";var s,o=a(51),n=a.n(o),r=a(49),l=a.n(r),i=a(3),c=a(39),u={user:null},d={user:function(e){return e.user},isLoggedIn:function(e){return null!==e.user}},m={checkAuth:function(){},loginAuth:function(e,t){var a=(e.commit,t.provider);return i.a.axios.get("/auth/"+a).then(function(e){console.log(a+" login success"),console.log(e),console.log(u.user)}).catch(function(e){console.log(a+" login error"),console.log(l()(e,null,2))})},login:function(e,t){var a=e.commit,s=t.email,o=t.password;return i.a.axios.post("/login",{email:s,password:o}).then(function(e){console.log("login success"),console.log(e),a(c.a,e.data),console.log(u.user)}).catch(function(e){console.log("login error"),console.log(e)})},logout:function(e){var t=e.commit;return i.a.axios.post("/logout").then(function(){t(c.a,null)})}},f=(s={},n()(s,c.a,function(e,t){e.user=t,localStorage.setItem("user",t)}),n()(s,c.b,function(e,t){e.user=null,localStorage.deleteItem("user")}),s);t.a={state:u,getters:d,actions:m,mutations:f}},function(e,t,a){"use strict";a.d(t,"a",function(){return s}),a.d(t,"b",function(){return o});var s="SET_USER",o="UNSET_USER"},function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={name:"app",metaInfo:{title:"Meetchu",titleTemplate:"%s | Meetchu"}}},function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={name:"dashboard",data:function(){return{msg:"Welcome to Your Vue.js App"}}}},function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={name:"home",metaInfo:{title:"Home"},data:function(){return{msg:"Welcome to Your Vue.js App"}}}},function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={name:"login",metaInfo:{title:"Log in"},data:function(){return{formstate:{},model:{name:"",email:"",password:""}}},methods:{fieldClassName:function(e){return e?(e.$touched||e.$submitted)&&e.$valid?"has-success":(e.$touched||e.$submitted)&&e.$invalid?"has-danger":void 0:""},onSubmit:function(){console.log(this.formstate.$valid)},login:function(){var e=this;console.log(this.$store),this.formstate.$valid&&this.$store.dispatch("login",{email:"a@a.com",password:"asdf"}).then(function(){console.log("success"),e.$router.push("/")}).catch(function(e){console.log("error"),console.log(e)})},loginAuth:function(e){this.$store.dispatch("loginAuth",{provider:e}).then(function(){console.log("success")}).catch(function(e){console.log("error"),console.log(e)})}}}},function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var s=a(90),o=a.n(s),n=a(89),r=a.n(n);t.default={name:"main",components:{AppNav:o.a,AppFooter:r.a},data:function(){return{}},computed:{authenticated:function(){return console.log(!!this.$store.state.user),!!this.$store.state.user}}}},function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={name:"signup",metaInfo:{title:"Sign up"},data:function(){return{formstate:{},model:{firstName:"",lastName:"",email:"",password:"",confirmPassword:""}}},methods:{fieldClassName:function(e){return e?(e.$touched||e.$submitted)&&e.$valid?"has-success":(e.$touched||e.$submitted)&&e.$invalid?"has-danger":void 0:""},onSubmit:function(){console.log(this.formstate.$valid)}}}},function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={name:"test",data:function(){return{msg:"This is a test."}}}},function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={name:"footer",data:function(){return{msg:"Footer"}}}},function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={name:"navbar",data:function(){return{msg:"Navbar"}}}},,,,,,,,,,,,,,,,,,,function(e,t){},function(e,t){},function(e,t){},function(e,t){},function(e,t){},function(e,t){},function(e,t){},function(e,t){},function(e,t){},,,,,,,function(e,t,a){a(74);var s=a(1)(a(40),a(98),null,null);e.exports=s.exports},function(e,t,a){a(70);var s=a(1)(a(41),a(94),"data-v-1a98dca8",null);e.exports=s.exports},function(e,t,a){a(67);var s=a(1)(a(42),a(91),"data-v-07c1b177",null);e.exports=s.exports},function(e,t,a){a(69);var s=a(1)(a(43),a(93),"data-v-0e596401",null);e.exports=s.exports},function(e,t,a){a(71);var s=a(1)(a(44),a(95),null,null);e.exports=s.exports},function(e,t,a){a(68);var s=a(1)(a(45),a(92),"data-v-092d0930",null);e.exports=s.exports},function(e,t,a){a(73);var s=a(1)(a(46),a(97),"data-v-3f3c20ac",null);e.exports=s.exports},function(e,t,a){a(72);var s=a(1)(a(47),a(96),"data-v-3706feb0",null);e.exports=s.exports},function(e,t,a){a(75);var s=a(1)(a(48),a(99),null,null);e.exports=s.exports},function(e,t,a){e.exports={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"container"},[a("div",{staticClass:"text-center"},[a("h1",{attrs:{id:"title"}},[e._v("Group study made easy.")]),a("p",{attrs:{id:"subtitle"}},[e._v("Meetchu simplifies messaging and scheduling so you can spend less time looking at the calendar and more time getting your work done.")]),e._m(0),a("router-link",{staticClass:"btn btn-lg btn-primary",attrs:{id:"btn-login",to:"/login",role:"button"}},[e._v("Get started")])],1)])},staticRenderFns:[function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"row"},[s("img",{staticClass:"mx-auto",attrs:{id:"home-logo",src:a(16)}})])}]}},function(e,t){e.exports={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"container"},[e._m(0),a("vue-form",{attrs:{state:e.formstate},on:{submit:function(t){t.preventDefault(),e.onSubmit(t)}},model:{value:e.formstate,callback:function(t){e.formstate=t},expression:"formstate"}},[a("div",{staticClass:"form-group row"},[a("label",{staticClass:"col-2 col-form-label"},[e._v("Name")]),a("validate",{staticClass:"col-5 required-field",class:e.fieldClassName(e.formstate.firstName),attrs:{"auto-label":"auto-label"}},[a("input",{directives:[{name:"model",rawName:"v-model.lazy",value:e.model.firstName,expression:"model.firstName",modifiers:{lazy:!0}}],staticClass:"form-control",attrs:{type:"text",name:"firstName",placeholder:"First",required:"required"},domProps:{value:e.model.firstName},on:{change:function(t){e.model.firstName=t.target.value}}}),a("field-messages",{staticClass:"form-control-feedback",attrs:{"auto-label":"auto-label",name:"firstName",show:"$touched || $submitted"}},[a("div",{slot:"required"},[e._v("First name is required.")])])],1),a("validate",{staticClass:"col-5 required-field",class:e.fieldClassName(e.formstate.lastName),attrs:{"auto-label":"auto-label"}},[a("input",{directives:[{name:"model",rawName:"v-model.lazy",value:e.model.lastName,expression:"model.lastName",modifiers:{lazy:!0}}],staticClass:"form-control",attrs:{type:"text",name:"lastName",placeholder:"Last",required:"required"},domProps:{value:e.model.lastName},on:{change:function(t){e.model.lastName=t.target.value}}}),a("field-messages",{staticClass:"form-control-feedback",attrs:{"auto-label":"auto-label",name:"lastName",show:"$touched || $submitted"}},[a("div",{slot:"required"},[e._v("Last name is required.")])])],1)],1),a("validate",{staticClass:"form-group row required-field",class:e.fieldClassName(e.formstate.email),attrs:{"auto-label":"auto-label"}},[a("label",{staticClass:"col-2 col-form-label"},[e._v("Email")]),a("div",{staticClass:"col-10"},[a("input",{directives:[{name:"model",rawName:"v-model.lazy",value:e.model.email,expression:"model.email",modifiers:{lazy:!0}}],staticClass:"form-control",attrs:{type:"email",name:"email",placeholder:"Email",required:"required"},domProps:{value:e.model.email},on:{change:function(t){e.model.email=t.target.value}}}),a("field-messages",{staticClass:"form-control-feedback",attrs:{"auto-label":"auto-label",name:"email",show:"$touched || $submitted"}},[a("div",{slot:"required"},[e._v("Email is required.")]),a("div",{slot:"email"},[e._v("Email is invalid")])])],1)]),a("validate",{staticClass:"form-group row required-field",class:e.fieldClassName(e.formstate.password),attrs:{"auto-label":"auto-label"}},[a("label",{staticClass:"col-2 col-form-label"},[e._v("Password")]),a("div",{staticClass:"col-10"},[a("input",{directives:[{name:"model",rawName:"v-model.lazy",value:e.model.password,expression:"model.password",modifiers:{lazy:!0}}],staticClass:"form-control",attrs:{type:"password",name:"password",placeholder:"Password",required:"required",minlength:"4"},domProps:{value:e.model.password},on:{change:function(t){e.model.password=t.target.value}}}),a("field-messages",{staticClass:"form-control-feedback",attrs:{name:"password",show:"$touched || $submitted"}},[a("div",{slot:"required"},[e._v("Password is required.")]),a("div",{slot:"minlength"},[e._v("Password must be at least 4 characters long.")])])],1)]),a("validate",{staticClass:"form-group row required-field",class:e.fieldClassName(e.formstate.confirmPassword),attrs:{"auto-label":"auto-label"}},[a("label",{staticClass:"col-2 col-form-label"},[e._v("Confirm Password")]),a("div",{staticClass:"col-10"},[a("input",{directives:[{name:"model",rawName:"v-model.lazy",value:e.model.confirmPassword,expression:"model.confirmPassword",modifiers:{lazy:!0}}],staticClass:"form-control",attrs:{type:"password",name:"confirmPassword",placeholder:"Confirm Password",required:"required",minlength:"4",pattern:e.model.password},domProps:{value:e.model.confirmPassword},on:{change:function(t){e.model.confirmPassword=t.target.value}}}),a("field-messages",{staticClass:"form-control-feedback",attrs:{name:"confirmPassword",show:"$touched || $submitted"}},[a("div",{slot:"pattern"},[e._v("Passwords do not match.")])])],1)]),a("div",{staticClass:"py-2 text-center"},[a("button",{staticClass:"btn btn-primary",attrs:{type:"submit"}},[e._v("Submit")])])],1),a("pre",[e._v(e._s(e.formstate))])],1)},staticRenderFns:[function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"page-header"},[a("h3",[e._v("Sign up")])])}]}},function(e,t){e.exports={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"container"},[e._m(0),a("div",{staticClass:"offset-md-1 col-md-10"},[a("vue-form",{attrs:{state:e.formstate},on:{submit:function(t){t.preventDefault(),e.onSubmit(t)}},model:{value:e.formstate,callback:function(t){e.formstate=t},expression:"formstate"}},[a("validate",{staticClass:"form-group row required-field",class:e.fieldClassName(e.formstate.email),attrs:{"auto-label":"auto-label"}},[a("label",{staticClass:"col-md-2 col-form-label"},[e._v("Email")]),a("div",{staticClass:"col-md-10"},[a("input",{directives:[{name:"model",rawName:"v-model.lazy",value:e.model.email,expression:"model.email",modifiers:{lazy:!0}}],staticClass:"form-control",attrs:{type:"email",name:"email",required:"required"},domProps:{value:e.model.email},on:{change:function(t){e.model.email=t.target.value}}}),a("field-messages",{staticClass:"form-control-feedback",attrs:{"auto-label":"auto-label",name:"email",show:"$touched || $submitted"}})],1)]),a("validate",{staticClass:"form-group row required-field",class:e.fieldClassName(e.formstate.password),attrs:{"auto-label":"auto-label"}},[a("label",{staticClass:"col-md-2 col-form-label"},[e._v("Password")]),a("div",{staticClass:"col-md-10"},[a("input",{directives:[{name:"model",rawName:"v-model.lazy",value:e.model.password,expression:"model.password",modifiers:{lazy:!0}}],staticClass:"form-control",attrs:{type:"password",name:"password",required:"required"},domProps:{value:e.model.password},on:{change:function(t){e.model.password=t.target.value}}}),a("field-messages",{staticClass:"form-control-feedback",attrs:{name:"password",show:"$touched || $submitted"}})],1)]),a("div",{staticClass:"py-2 text-center"},[a("button",{staticClass:"btn btn-primary",on:{click:function(t){e.login()}}},[e._v("Login")])]),a("div",{staticClass:"py-2 text-center"},[a("button",{staticClass:"btn btn-block btn-google btn-social offset-md-3 col-md-6",on:{click:function(t){e.loginAuth("google")}}},[a("i",{staticClass:"fa fa-google-plus"}),e._v("Sign in with Google")]),a("button",{staticClass:"btn btn-block btn-facebook btn-social offset-md-3 col-md-6",on:{click:function(t){e.loginAuth("facebook")}}},[a("i",{staticClass:"fa fa-facebook"}),e._v("Sign in with Facebook")])])],1),a("pre",[e._v(e._s(e.formstate))])],1)])},staticRenderFns:[function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"page-header"},[a("h3",[e._v("Sign in")])])}]}},function(e,t,a){e.exports={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"container text-center"},[a("h1",{attrs:{id:"title"}},[e._v("Group study made easy.")]),a("p",{attrs:{id:"subtitle"}},[e._v("Meetchu simplifies messaging and scheduling so you can spend less time looking at the calendar and more time getting your work done.")]),e._m(0),a("router-link",{staticClass:"btn btn-lg btn-primary",attrs:{to:"/login",role:"button"}},[e._v("Get started")])],1)},staticRenderFns:[function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"row text-center"},[s("img",{staticStyle:{"max-width":"80%"},attrs:{src:a(16)}})])}]}},function(e,t){e.exports={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("app-nav"),a("div",{staticClass:"container"}),a("div",{attrs:{id:"main"}},[a("router-view")],1)],1)},staticRenderFns:[]}},function(e,t){e.exports={render:function(){var e=this,t=e.$createElement;return(e._self._c||t)("div")},staticRenderFns:[]}},function(e,t){e.exports={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"test"},[a("h1",[e._v(e._s(e.msg))])])},staticRenderFns:[]}},function(e,t){e.exports={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{attrs:{id:"app"}},[a("router-view")],1)},staticRenderFns:[]}},function(e,t){e.exports={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("b-navbar",{attrs:{toggleable:"toggleable",type:"inverse",variant:"primary",fixed:"fixed"}},[a("b-nav-toggle",{attrs:{target:"nav_collapse_example"}}),a("div",{staticClass:"container"},[a("b-link",{staticClass:"navbar-brand",attrs:{to:"/"}},[a("span",[e._v("Meetchu")])]),a("b-collapse",{attrs:{id:"nav_collapse_example","is-nav":"is-nav"}},[a("b-nav",{staticClass:"ml-auto",attrs:{"is-nav-bar":"is-nav-bar"}},[a("b-nav-item",{attrs:{to:"/login"}},[e._v("Login")]),a("b-nav-item",{attrs:{to:"/signup"}},[e._v("Sign up")])],1)],1)],1)],1)},staticRenderFns:[]}},,,,,function(e,t,a){e.exports=a(17)}],[104]);
//# sourceMappingURL=app.1f027436c4cf3de7f09b.js.map