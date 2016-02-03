<?php include "views/header.tpl"; ?>

<div class="next-card no-padding no-padding-bottom">
  <header class="next-pane__header">
    <h3>Something went wrong</h3>
  </header>

  <section class="next-card">
    <form action="<?php echo SCRIPT_URL?>">
      <button class="btn btn-large btn-primary" type="submit">Try again</button>
    </form>
  </section>
</div>

<?php include "views/footer.tpl";