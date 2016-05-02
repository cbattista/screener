function Difficulty(params) {
  this.param_space = new Param_Space(params);
  this.grader = new Grader();
  this.ns = ['', ''];

  this.give_side = new GiveItems(["left", "right"], 3);
  this.give_con = new GiveItems(["con", "incon"], 3);
  this.give_ex = new GiveItems([1,2,3,4], 2);
  this.img_side = new GiveItems(['left', 'right'], 3);

  this.lastN1 = 0;
  this.lastN2 = 0;

  this.adjust = function(){
    ACC = this.grader.ACC;
    RT = this.grader.RT;
    easyness = this.grader.easyness;

    //if we have already found the sticking point
    if (this.param_space.stuck == true) {
      this.param_space.search();
    }
    else {
      //have we found the sticking point?
      if (this.grader.streak < 0) {
        this.param_space.sticking_point();
      }

      //otherwise
      else {
        //first check accuracy
        if (easyness < 0 ) {
          this.param_space.adjust([-1, -1]);
        } else {

          if (easyness > 0.5) {
            //increment both by 1
            if (practice.practice == false) {
              this.param_space.adjust([2, 2]);
            } else {
              this.param_space.adjust([1, 1]);
            }
          } else if (easyness > 0.25) {
            if (practice.practice == false) {
              this.param_space.adjust([1, 1], true);
            } else {
              this.param_space.adjust([0, 1], true);
            }
          }
          else if (easyness > 0.1) {
            //just hang out in this space...
            this.param_space.adjust([1,-1], true);
          } else {
            this.param_space.adjust([-1, -1]);
          }

        }
      }
    }

  }
};

/*
ORPHAN LOGGING CODE

    //get the RT, and its zscore
    t = new Date();
    this.RT = t.getTime() - start_time;
    this.RTs.push(this.RT);

    n1 = Math.min(diff.ns[0], diff.ns[1]);
    n2 = Math.max(diff.ns[0], diff.ns[1]);

    /*
    distance = n2 - n1;
    ratio = (n1 / n2).toFixed(2);

    subject.inputData("ratio", ratio);
    subject.inputData("distance", distance);
    ni = diff.param_space.normed_indexes();
    subject.inputData("diff1", ni[0]);
    subject.inputData("diff2", ni[1]);
    subject.inputData("stuck", diff.param_space.stuck);
    subject.inputData("n1", n1);
    subject.inputData("n2", n2);
    subject.inputData("ACC", this.ACC);
    subject.inputData("RT", this.RT);
    subject.inputData("practice", practice.practice);
    subject.inputData("easyness", this.easyness);
    subject.inputData("avg_easyness", this.streak);

    console.log(trial_clock.trial, user_resp, diff.CRESP);

    //emit grade event

  };

}
*/
