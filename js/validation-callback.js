_.extend(Backbone.Validation.callbacks, {
  valid: function(view, attr, selector){
     var control = view.$('[' + selector + '=' + attr + ']');
    control.removeClass('input-error');
    control.parent().find(".input-error-feedback").remove();
  },
  invalid: function(view, attr, error, selector) {
    var control = view.$('[' + selector + '=' + attr + ']');
    control.addClass('input-error');
	error_feedback =  control.parent().find(".input-error-feedback")
	if (error_feedback !== "undefined")
		 control.parent().find(".input-error-feedback").remove();
    control.parent().append("<div class='input-error-feedback'> " + error + "</div>")
  }
});