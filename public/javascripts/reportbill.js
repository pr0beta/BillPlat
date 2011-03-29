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
        console.log('  id:' + this.cid);
        console.log('  participants: ' + this.get('participants'));
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
        id: 'b1'
      , description:'Red Bamboo'
      , participants: [{id: 'p1', fullname: 'Zachary Cancio'}, {id: 'p2', fullname: 'Katie Rausch'}, {id: 'p3', fullname: 'Heidi Rausch'}]
      , line_items: [
        {
            id: 'l1'
          , description: "Chicken Wings"
          , amount_in_cents: 800
          , participants: ['p1', 'p2']
        },
        {
            id: 'l2'
          , description: "Curry Chicken"
          , amount_in_cents: 700
          , participants: []

        }]
      }
    ]);
    

    // Define View Classes
    // ===================
    
    // View for a bill
    BillView = Backbone.View.extend({
        render: function() {
            // Redraw - notice that we don't know if this.el is inserted
            // in the DOM or not
            this.el = 
                _.template(
                  '<div class="bill">' +
                    '<h3 class="description"><a><%= description %></a></h3>' +
                    '<h3 class="date"><a>March 12, 2011</a></h3>' +
                    '<table id="lineitems_table">' + 
                      '<thead><tr class="lineitem"><th class="description">Description</th><th class="amount">Amount</th></tr></thead>' +
                      '<tfoot>' + 
                        '<tr><td class="add_line_item"><a href="">add item</a></td><td></td></tr>' +
                        '<tr class="lineitem"><td class="total">Sub Total</td><td class="amount">300</td>' +
                        '<tr class="lineitem"><td class="total">Tax</td><td class="amount"><a>200</a></td>' +
                        '<tr class="lineitem"><td class="total">Tip</td><td class="amount"><a>100</a></td>' +
                        '<tr class="lineitem"><td class="total">&nbsp</td><td></td>' +
                        '<tr class="lineitem"><td class="total">Grand Total</td><td class="amount">2100</td>' +
                      '</tfoot>' +
                      '<tbody id="lineitems"></tbody>' +
                    '</table>' +
                    '<div></div>' +
                  '</div>'
                , this.model.toJSON());
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
    
    // View for line item within bill
    LineItemView = Backbone.View.extend({
      render: function(){
        this.el = _.template(
          '<tr class="lineitem data" data-id="<%= id %>">' +
            '<td class="description"><a><%= description %></a></td>' +
            '<td class="amount"><a><%= amount_in_cents %></a></td>' +
          '</tr>' 
          , this.model.toJSON());
        return this;
      }
      
    });
    
    // View for participants in lineitem upon rollover
    LineItemParticipantsView = Backbone.View.extend({
      render: function(){
        this.el = _.template(
          '<div class="lineitem_participants">Heidi</div>'
        , this.model.toJSON());
        return this;
      }
    });
    
    
    // View for the participants on the right hand sidebar
    ParticipantView = Backbone.View.extend({
      render: function(){
          this.el = _.template('<li><%= fullname %></li>', this.model.toJSON());
          return this;
      }
    });
    

    // Create View Instances
    myBillViews = myBills.map(function(myBill) {
        var myBillView = new BillView({model: myBill});
        $('#billwrapper').append(myBillView.render().el);
        var myLineItemViews = myBill.line_items.map(function(myLineItem){
          var myLineItemView = new LineItemView({model: myLineItem});
          $('#lineitems').append(myLineItemView.render().el);
        });
        
        $('#billwrapper').append(_.template('<ol id="participants"><lh>Participants</lh></ol>'));
        
        var myParticipantViews = myBill.participants.map(function(myParticipant){
          var myParticipantView = new ParticipantView({model: myParticipant});
          $('#participants').append(myParticipantView.render().el);
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
    
    $('.lineitem.data').live('mouseover', function(event) {
      var lineitem_id = $(event.currentTarget).data("id");
      // line_items is a collection of a bill so we don't use get.
      var lineitem_participants = myBills.first().line_items.get(lineitem_id).get('participants');
      console.log(lineitem_participants);

    });
});