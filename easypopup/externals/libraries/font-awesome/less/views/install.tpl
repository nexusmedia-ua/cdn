<?php include "views/header.tpl"; ?>

<div class="grid">
  <div class="grid__item large--one-third push--large--one-third">
    <div class="section text-center">
      <h2><?php echo APP_TITLE ?></h2>
    </div>

    <div class="panel">
      <form action="<?php echo SCRIPT_MAIN_URL?>" method="get">
        <div class="grid">
          <div class="grid__item one-whole no-padding-bottom">
            <label>The URL of your Shop</label>
            <input type="text" name="shop" id="shop" placeholder="myshop.myshopify.com" >
            <div class="text-right">
              <button class="btn btn-primary" type="submit">Install</button>
            </div>
          </div>
        </div>
      </form>
    </div>

  </div>
</div>

<?php include "views/footer.tpl";