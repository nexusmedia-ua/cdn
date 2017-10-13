var currentPlan = "starter";
var data = [];

document.addEventListener('DOMContentLoaded', run);
console.clear();

function run() {
    setCurrentPlan();
}

function setCurrentPlan() {
    var allPlansBlocks = document.querySelectorAll('.pricing-plan');
    for (var i = 0; i < allPlansBlocks.length; i++) {
        if (allPlansBlocks[i].getAttribute('plan') === currentPlan) {
            makeButtonSelected(allPlansBlocks[i]);
        } else if (allPlansBlocks[i].getAttribute('disabled') === 'false') {
            makeButtonNotSelected(allPlansBlocks[i]);
            allPlansBlocks[i].querySelector('.btn').addEventListener('click', changePlan);
        }else if (allPlansBlocks[i].getAttribute('disabled') === 'true') {
            makeButtonDisabled(allPlansBlocks[i]);
        }
    }
}

function makeButtonSelected(planBlock) {
    planBlock.querySelector('.btn').innerText = "You're on this plan";
    planBlock.querySelector('.btn').className = 'btn btn-large';
    planBlock.querySelector('.btn').disabled = true;
}

function makeButtonNotSelected(planBlock) {
    planBlock.querySelector('.btn').innerText = "Choose this plan";
    planBlock.querySelector('.btn').className = 'btn btn-primary btn-large has-loading';
    planBlock.querySelector('.btn').disabled = false;
}

function makeButtonDisabled(planBlock) {
    planBlock.querySelector('.btn').innerText = "Not available yet";
    planBlock.querySelector('.btn').className = 'btn btn-primary btn-large btn-disabled';
    planBlock.querySelector('.btn').disabled = true;
}

function changePlan() {
    currentPlan = this.closest('.pricing-plan').getAttribute('plan');
    data['current_plan'] = currentPlan;
    data['user'] = 'User';
    apiRequest('POST', '&task=post_plan', renderSaved, data);
    run();
}

function renderSaved() {
    console.log(1);
}