/* Scaled-down Backbone.js demonstration
 * By Jacob Oscarson (http://twitter.com/jacob414), 2010
 * MIT Licenced, see http://www.opensource.org/licenses/mit-license.php */
$(function() {
    window.ulog = function(msg) { $('#log').append($('<div>'+msg+'</div>')); };

    // Faking a little bit of Backbone.sync functionallity
    Backbone.sync = function(method, model, succeeded) {
        ulog('<strong>'+method + ":</strong>  " + model.get('label'));
        if(typeof model.cid != 'undefined') {
            // It's a freshly made model
            var cid = model.cid;
            // ..fake that it's .cid turns into a "real" .id:
            model.unset('cid').set({id:cid}, {silent:true});
        }
        // Oh yes, it all went sooo well ;-)
        succeeded(model);
    };

    Participant = Backbone.Model.extend({
      initialize: function(){
        console.log('initializing ' + this.get('fullname'));
      }
    });
    Participants = Backbone.Collection.extend({
        model: Participant
      , initialize: function(models, options){
        this.bill = options.bill;
      }
    });

    LineItem = Backbone.Model.extend({
      initialize: function(){
        console.log('initializing ' + this.get('description'));
      }
    });
    LineItems = Backbone.Collection.extend({
      model: LineItem
      , initialize: function(models, options){
        this.bill = options.bill;
      }
    });

    Bill = Backbone.Model.extend({
      initialize: function() {
        this.line_items = new LineItems(this.get('line_items'), {bill: this});
        this.participants = new Participants(this.get('participants'), {bill :this});
        // this.messages.url = '/mailbox/' + this.id + '/messages';
        // this.messages.bind("refresh", this.updateCounts);
      }
    });
    Bills = Backbone.Collection.extend({model:Bill});
    

    // Create a 'Models' instance, and give it a dataset we can play with
    myBills = new Bills([
      {
        id: 'm1'
      , description:'Red Bamboo'
      , participants: [{fullname: 'Zachary Cancio'}, {fullname: 'Katie Rausch'}, {fullname: 'Heidi Rausch'}]
      , line_items: [
        {
            description: "0123456789012345678901234567890123456789"
          , amount_in_cents: 800
        }]
      }
    ]);
    

    // Define View Classes
    BillView = Backbone.View.extend({
        render: function() {
            // Redraw - notice that we don't know if this.el is inserted
            // in the DOM or not
            $(this.el).html(
                _.template('<h3><%= description %></h3><h3>March 12, 2011</h3><table id="lineitems"><thead><tr class="lineitem"><th class="description">Description</th><th class="amount">Amount</span></th></tr></thead></table>',
                           this.model.toJSON()));
            // Returning this.el instead could also be a good idea..
            return this;
        },
        events: {
            'change input': 'change'
        },
        change: function() {
            var newval = this.$('input').val();
            ulog('<em>Changing '+this.model.get('label')+' to '+newval+"</em>");
            this.model.set({label:newval});
        }
    });
    
    LineItemView = Backbone.View.extend({
      render: function(){
        this.el = _.template('<tr class="lineitem"><td class="description"><%= description %></td><td class="amount"><%= amount_in_cents %></td></tr>'
          , this.model.toJSON());
        return this;
      }
      
    });

    // Create View Instances
    myBillViews = myBills.map(function(myBill) {
        var myBillView = new BillView({model: myBill});
        $('#content').append(myBillView.render().el);
        
        var myLineItemViews = myBill.line_items.map(function(myLineItem){
          var myLineItemView = new LineItemView({model: myLineItem});
          $('#lineitems').append(myLineItemView.render().el);
        });
        return myBillView;
    });
    

    $('#save').click(function() {
        // This doesn't feel completely right..
        myBills.each(function(myBill) { myBill.save(); });
    });

    $('#add').click(function() {
        var myBill = myBills.create({label:'New item'});
        var myBillView = new BillView({model:myBill});
        $('#content').append(myBillView.render().el);
    });
});