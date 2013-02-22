/*
 * Backbone Model, View, Route for Driver cost tracking
 * Appear assignment 1
*/

/* Constants */
var FIXED_KILOMETER_PRICE = 100;
var FIXED_HOUR_PRICE = 250;

$(function() {
	
	
	/* Model definition */
	var OrderModel = Backbone.Model.extend({
		 defaults: {
				state : "input", //state of the form [input: user editing, view: user confirming]
				price_hour: "0",
				price_dist: "0",
				price_total: "0"
		},
		
		validation: {
			title: {
				required: true,
				msg: "Please provide your Title"
			},
			estimated_time: [
				{
					required: true,
					msg: "Please provide an Estimated time"
				}, {
					pattern: /^\d{1,2}:\d{1,2}$/,
					msg: "Time esmtimate should be of format HH:MM"
				}
			],
			estimated_dist: [
				{
					required: true,
					msg: "Please provide a driving distance",
				}, {
					pattern: /^\d+[.,]\d+$/,
					msg: "Distance should be of format Kilometers Meters separated by . or ,"
				}
			] 
			
		}
	})
	
	/* Collection to save the models in Local storage */
	var Orders = Backbone.Collection.extend({
		model: OrderModel,
		localStorage: new Store("appear"),
	})
	
	var orders = new Orders();
	
	/* View definition */
	var FormOrderView = Backbone.View.extend({
		events: {
			"keyup #estimated_time": "calculateHour",
			"keyup #estimated_dist": "calculateDistance",
			"blur inut": "update",
			"click #submit": "submit",
			"click #home": function() {
				this.model.set({state: "input"})
				this.render();
			}
		},
		formTemplate: _.template($("#order-form-template").html()),
		update: function(el) {
			var $el = $(el.target);
    		this.model.set($el.attr("name"), $el.val());
		},
		
		calculateHour: function(el) {
			this.update(el);
			this.$("#price_hour").text("waiting ...");
			if (this.model.isValid("estimated_time")) {
				estimated_time = this.model.get("estimated_time")
				time_detail = estimated_time.split(":")
				hours = parseInt(time_detail[0]);
				minutes = parseInt(time_detail[1]);
				price = (FIXED_HOUR_PRICE * (hours + minutes/60)).toFixed(2)
				this.model.set({price_hour: price});
				price_dist = this.model.get("price_dist")
				this.$("#price_hour").text(price + "$");
				var totalprice = (parseFloat(price) + parseFloat(price_dist)).toFixed(2);
				this.$("#price_total").text(totalprice + "$");
				this.model.set({price_total: totalprice});
			}
		},
		
		calculateDistance: function(el) {
			this.update(el);
			this.$("#price_dist").text("waiting ...");
			if (this.model.isValid("estimated_dist")) {
				estimated_dist = this.model.get("estimated_dist")
				dist_detail = estimated_dist.split((estimated_dist.match(/\D/))[0])
				kilometers = parseInt(dist_detail[0]);
				meters = parseInt(dist_detail[1]);
				price = (FIXED_KILOMETER_PRICE * (kilometers + meters/1000)).toFixed(2)
				this.model.set({price_dist: price});
				price_hour = this.model.get("price_hour")
				this.$("#price_dist").text(price + "$");
				var totalprice = (parseFloat(price) + parseFloat(price_hour)).toFixed(2);
				this.$("#price_total").text(totalprice + "$");
				this.model.set({price_total: totalprice});
				
			}
		},
		
		render: function() {
			$(this.el).html(this.formTemplate(this.model.toJSON()))
			/* considering the browser cache */
			if(this.model.get("estimated_time") == null) {
				this.$("#estimated_time").val("")
				this.$("#estimated_dist").val("")
			}
			Backbone.Validation.bind(this);
			return this;
		},
		
		submit: function(e) {
			e.preventDefault();
			
			if (this.model.get("state") == "input") {
				var data = this.$("form").serializeObject();
				this.model.set(data);
				if(this.model.isValid()) {
					this.model.set({"state": "view"})
					this.render();
					$("#home").css("display", "block");
				}
			} else {
				orders.create(this.model.toJSON());
				Backbone.Validation.unbind(this);
				this.model.clear();
				this.model = new OrderModel({"state":"input"})
				this.render();
			}
		}
	})
	
	var OrderView = Backbone.View.extend({
		tagName: "li",
		template: _.template($("#order-template").html()),
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	})
	
	var ListView = Backbone.View.extend({
		initialize: function() {
			orders.fetch();
		},
		
		render: function() {
			orders.each(function(order) {
				this.addOrder(order);	
			}, this)
			return this;
		},
		addOrder: function(order) {
			var view = new OrderView({model: order});
      		this.$el.append(view.render().el);
		}
	})
	var Router = Backbone.Router.extend({
		routes: {
			"":"orderForm",
			"list": "listOrders"
		},
		
		orderForm: function() {
			/* Create orderView object */
	 		this.show(new FormOrderView({model: new OrderModel()}));
		},
		
		listOrders: function() {
			this.show(new ListView());
		},
		
		show: function(view) {
			if(this.currentView){
			  this.currentView.remove();
			}
			this.currentView = view;
			$("#container").html(view.render().el);
		}
	})
	new Router();
	Backbone.history.start();
})	
