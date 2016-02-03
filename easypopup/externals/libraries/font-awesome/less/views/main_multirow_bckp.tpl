<?php $gridstack = true;?>
<?php include "views/header.tpl"; ?>

<section>
  <div class="grid">
    <div class="grid__item large--two-thirds medium--two-thirds small--one-whole text-center">

      <div class="next-card no-padding no-padding-bottom">
        <div id="component-holder"></div>

        <ul id="layout-main-menu-bottom" class="next-list--divided">
          <li>
            <a href="javascript:void(0)" data-bind="click: add_new_row">New Row</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="grid__item large--one-third medium--one-third small--one-whole">
      <div class="next-card no-padding no-padding-bottom">
        <header class="next-pane__header">
          <h3>New Popup</h3>
        </header>
        <section id="component-menu" class="next-pane__body">
          <ul class="next-list--divided">
            <li>
              <a href="javascript:void(0)" data-bind="click: add_new_widget">Heading</a>
            </li>
            <li>
              <a href="javascript:void(0)" data-bind="click: add_new_widget">Image</a>
            </li>
            <li>
              <a href="javascript:void(0)" data-bind="click: add_new_row">New Row</a>
            </li>
          </ul>
        </section>
        <div class="next-pane__footer-wrapper text-right">
          <div class="next-pane__footer">
            <button class="btn btn-primary">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<script type="text/javascript">
  function koRegister(name) {
    ko.components.register(name, {
      viewModel: {
        createViewModel: function (controller, componentInfo) {
          var ViewModel = function (controller, componentInfo) {
            var grid = null;

            this.widgets = controller.widgets;

            this.afterAddWidget = function (items) {
              if (grid == null) {
                grid = $(componentInfo.element).find('.grid-stack').gridstack({
                  auto: false
                }).data('gridstack');
              }

              var item = _.find(items, function (i) { return i.nodeType == 1 });
              grid.add_widget(item);
              ko.utils.domNodeDisposal.addDisposeCallback(item, function () {
                grid.remove_widget(item);
              });
            };
          };

          return new ViewModel(controller, componentInfo);
        }
      },
      template:
        [
          '<div class="grid-stack" data-bind="foreach: {data: widgets, afterRender: afterAddWidget}">',
          '  <div class="grid-stack-item" data-bind="attr: {\'data-gs-x\': $data.x, \'data-gs-y\': $data.y, \'data-gs-width\': $data.width, \'data-gs-height\': $data.height, \'data-gs-auto-position\': $data.auto_position, \'data-gs-type\': $data.type, \'data-gs-max-height\': $data.max_height, \'data-gs-min-height\':  $data.min_height}">',
          '    <div class="grid-stack-item-content">',
          '      <button class="delete-widget" data-bind="click: $root.delete_widget"></button>',
          '      <button class="edit-widget" data-bind="click: function(){ editWidgetContent($data, this)}"></button>',
          '      <div class="widget-type-preview" data-bind="text: $data.type"></div>',
          '     </div>',
          '  </div>',
          '</div>'
        ].join('')
    });
  }


  function editWidgetContent(el)
  {
    var type = el.getAttribute('data-gs-type');
    alert(type);
  }

  function Controller(widgets)
  {
    var self = this;

    this.widgets = ko.observableArray(widgets);

    this.add_new_widget = function(controller, type) {
      this.widgets.push({
        x: 0,
        y: 0,
        width: Math.floor(4),
        height: Math.floor(2),
        type: type,
        auto_position: true
      });
    };

    this.delete_widget = function (item) {
      self.widgets.remove(item);
    };
  };

  $(function () {
    add_new_row(true);
  });


  function add_new_row( menuInit )
  {
    var containerName, rowName, rand, allRows;
    do {
      rand = parseInt(Math.random() * 100000);
      containerName = 'layout-row-container-' + rand;
      rowName = 'layout-row-' + rand;
    } while( $(containerName).length > 0 );

    $('#component-holder').append(
      [
        '<div id="' + containerName + '" class="layout-row-container">',
        '  <header class="layout-row-header">',
        '    <h4>Row <span class="row-number"></span>',
        '      <a href="javascript:void(0)" class="layout-row-remove" onclick="remove_row(\'' + rand + '\')">remove</a>',
        '    </h4>',
        '    <ul class="layout-row-menu">',
        '      <li><a href="javascript:void(0)" data-bind="click: function(){ add_new_widget($data, \'text\')}">Text</a></li>',
        '      <li><a href="javascript:void(0)" data-bind="click: function(){ add_new_widget($data, \'image\')}">Image</a></li>',
        '      <li><a href="javascript:void(0)" data-bind="click: function(){ add_new_widget($data, \'html\')}">HTML</a></li>',
        '      <li><a href="javascript:void(0)" data-bind="click: function(){ add_new_widget($data, \'social\')}">Social Buttons</a></li>',
        '    </ul>',
        '  </header>',
        '  <div id="' + rowName + '" class="layout-row" data-bind="component: {name: \'' + rowName + '\', params: $data}">',
        '  </div>',
        '</div>'
      ].join('')
    );

    allRows = $('#component-holder div.layout-row-container');
    allRows.each(function(i, el){
      $(el).find('span.row-number').text(i+1);
    });

    var widgets = [{x: 0,  y: 0, width: 2, height: 2, type: 'image'},
                   {x: 2,  y: 0, width: 8, height: 2, type: 'html'},
                   {x: 10, y: 0, width: 2, height: 2, type: 'social'}];
    var controller = new Controller(widgets);
    koRegister(rowName);

    ko.applyBindings(controller, document.getElementById(containerName));
    if( menuInit === true ) {
      ko.applyBindings(new Controller(widgets), document.getElementById('layout-main-menu-bottom'));
    }
  }

  function remove_row( numRow )
  {
    if( $('#component-holder div.layout-row-container').length == 1 ) return false;
    ko.components.unregister('layout-row-' + numRow );
    $('#layout-row-container-' + numRow).remove();

    $('#component-holder div.layout-row-container').each(function(i, el){
      $(el).find('span.row-number').text(i+1);
    });
  }
</script>



<?php /*
<div class="loader">
  <div class="next-spinner">
    <svg class="next-icon next-icon--40" preserveAspectRatio="xMinYMin"><circle class="next-spinner__ring" cx="50%" cy="50%" r="45%"></circle></svg>
  </div>
</div>

<section class="section-table">
    <ul class="tab_list" role="tablist">
        <li>
            <a class="active" href="/" role="tab" tabindex="0">All Products</a>
        </li>
        <li>
            <a href="/" role="tab" tabindex="-1">Open</a>
        </li>
    </ul>
    <div class="next-card">
        <input class="obj-filter-text " id="query" name="query" placeholder="Search for products..." type="text">
        <table>
            <tr>
                <th></th>
                <th>Product</th>
                <th></th>
            </tr>
            <tr>
                <td width="65" class="image text-left"><a href="#"><img width="50" src="https://cdn.shopify.com/s/assets/no-image-ebbb8733fb8568738989cf5f4c47aa16.png" /></a></td>
                <td><a href="#">Product Name 1</a></td>
                <td class="text-right"><a href="#" class="btn">Edit Sizing Table</a></td>
            </tr>
        </table>
    </div>
</section>

<hr/>

<section>
    <div class="grid">
        <div class="section-summary grid__item large--one-third medium--one-third small--one-whole">
            <h3>Details</h3>
            <p>Edit your store information. The store name shows up on your storefront, while the title and meta description help define how your store shows up on search engines.</p>
        </div>
        <div class="next-card grid__item large--two-thirds medium--two-thirds small--one-whole">
            <label for="shop_name">Name</label>
            <input id="shop_name" name="shop[name]" size="30" type="text" value="Social Sign In">

            <div class="grid--wide no-padding">
              <div class="grid__item one-half">
                <label for="shop_email">Account email</label>
                <input class="sb" id="shop_email" name="shop[email]" size="30" type="text" value="shopifier@nexus.in.ua">
                <p class="note">Email used for Shopify to contact you about your account</p>
              </div>

              <div class="grid__item one-half">
                  <label for="shop_customer_email">Customer email</label>
                  <input id="shop_customer_email" name="shop[customer_email]" size="30" type="text" value="shopifier@nexus.in.ua">
                  <p class="note">Your customers will see this when you email them (e.g.: order confirmations)</p>
              </div>
            </div>
            <div class="ssb">
                <input id="shop_password_enabled" name="shop[password_enabled]" type="checkbox" value="1">
                <label class="inline" for="shop_password_enabled">Password protect your storefront</label>
            </div>
            <label for="shop_analytics_snippet">Google Analytics account
              <span class="note">
                <a class="subdued" href="https://docs.shopify.com/manual/settings/general/google-analytics" target="_blank">(how do I set this up?)</a>
              </span>
            </label>
            <textarea id="shop_analytics_snippet" name="shop[analytics_snippet]" placeholder="Paste your code from Google here"></textarea>
        </div>
    </div>
</section>

<hr/>

<section>
    <div class="next-card">
        <label for="shop_name">Name</label>
        <input id="shop_name" name="shop[name]" size="30" type="text" value="Social Sign In">

        <div class="grid--wide no-padding">
          <div class="grid__item one-half">
            <label for="shop_email">Account email</label>
            <input class="sb" id="shop_email" name="shop[email]" size="30" type="text" value="shopifier@nexus.in.ua">
            <p class="note">Email used for Shopify to contact you about your account</p>
          </div>

          <div class="grid__item one-half">
              <label for="shop_customer_email">Customer email</label>
              <input id="shop_customer_email" name="shop[customer_email]" size="30" type="text" value="shopifier@nexus.in.ua">
              <p class="note">Your customers will see this when you email them (e.g.: order confirmations)</p>
          </div>
        </div>
    </div>
</section>

<hr/>

<section>
    <div class="grid">
        <div class="grid__item large--one-half medium--one-half small--one-whole">
            <div class="next-card">
                <table>
                    <tr>
                        <th>&nbsp;</th>
                        <th class="stat__heading">Total Sales</th>
                        <th class="stat__heading">Order Count</th>
                    </tr>
                    <tr>
                        <td class="stat__heading stat--green">Today</td>
                        <td class="stat__number stat--green">₴0.00</td>
                        <td class="stat__number stat__number">0</td>
                    </tr>
                    <tr>
                        <td class="stat__heading">Yesterday</td>
                        <td>₴0.00</td>
                        <td>0</td>
                    </tr>
                    <tr>
                        <td class="stat__heading">Last 7 days</td>
                        <td>₴0.00 </td>
                        <td>0</td>
                    </tr>
                    <tr>
                        <td class="stat__heading">Last 30 days</td>
                        <td>₴0.00 </td>
                        <td>0</td>
                    </tr>
                    <tr>
                        <td class="stat__heading">Last 90 days</td>
                        <td>₴0.00 </td>
                        <td>0</td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="grid__item large--one-half medium--one-half small--one-whole text-right">
            <div class="next-card">
                <a class="btn" href="#">Cancel</a>
                <a class="btn btn-primary" href="#">Save</a>
            </div>
        </div>
    </div>
</section>

<section>
    <div class="grid">
        <div class="grid__item large--two-thirds medium--two-thirds small--one-whole text-center">
            <div class="next-card">
                Some content like page constructor goes here
            </div>
        </div>
        <div class="grid__item large--one-third medium--one-third small--one-whole">
            <div class="next-card no-padding no-padding-bottom">
                <header class="next-pane__header">
                    <h3>Page Title</h3>
                </header>
                <section class="next-pane__body">
                    <ul class="next-list--divided">
                        <li>
                            <a href="#">Heading</a>
                        </li>
                        <li>
                            <a href="#">Widget 1</a>
                        </li>
                        <li>
                            <div class="next-pane--form">
                                <label for="shop_customer_email">Customer email</label>
                                <input id="shop_customer_email" name="shop[customer_email]" size="30" type="text" value="shopifier@nexus.in.ua">
                                <p class="note">Your customers will see this when you email them (e.g.: order confirmations)</p>
                                <label for="shop_customer_email">Customer email</label>
                                <input id="shop_customer_email" name="shop[customer_email]" size="30" type="text" value="shopifier@nexus.in.ua">
                                <p class="note">Your customers will see this when you email them (e.g.: order confirmations)</p>
                                <label for="shop_customer_email">Customer email</label>
                                <input id="shop_customer_email" name="shop[customer_email]" size="30" type="text" value="shopifier@nexus.in.ua">
                                <p class="note">Your customers will see this when you email them (e.g.: order confirmations)</p>
                            </div>
                        </li>
                        <li>
                            <a href="#">Image 1</a>
                        </li>
                        <li>
                            <a href="#">Footer</a>
                        </li>
                    </ul>
                </section>
                <div class="next-pane__footer-wrapper text-right">
                    <div class="next-pane__footer">
                        <button class="btn btn-primary">Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
*/?>


<?php include "views/footer.tpl"; ?>