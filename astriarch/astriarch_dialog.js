/**
 * A Generic Dialog window constructor
 * @constructor
 */
Astriarch.Dialog = function(contentSelector, title, width, height, okCallback, cancelCallback) {
	
	this.DialogResult = false;
	
	this.okCallback = okCallback;
	this.cancelCallback = cancelCallback;
	
	var self = this;
	this.dlg = $(contentSelector).dialog({'autoOpen':false, 'resizable':false, 'title':title, 'width':width, 'height':height, 'modal':true,
			'buttons':	[
							{
								text: "Ok",
								click: function() { self.okClose(); }
							},
							{
								text: "Cancel",
								click: function() { self.cancelClose(); }
							}
						]
				}
			);
	
};

/**
 * Opens this dialog window
 * @this {Astriarch.Dialog}
 */
Astriarch.Dialog.prototype.open = function() {
	this.dlg.dialog('open');
};

/**
 * Closes this dialog window with the ok callback
 * @this {Astriarch.Dialog}
 */
Astriarch.Dialog.prototype.okClose = function() {
	this.DialogResult = true;
	if(typeof this.okCallback == 'function')
		this.okCallback();
	this.dlg.dialog('close');
};

/**
 * Closes this dialog window with the cancel callback
 * @this {Astriarch.Dialog}
 */
Astriarch.Dialog.prototype.cancelClose = function() {
	this.DialogResult = false;
	if(typeof this.cancelCallback == 'function')
		this.cancelCallback();
	this.dlg.dialog('close');
};

/**
 * Sets the dialog window's title
 * @this {Astriarch.Dialog}
 */
Astriarch.Dialog.prototype.setTitle = function(title){
	this.dlg.dialog("option" , 'title' , title );
};

