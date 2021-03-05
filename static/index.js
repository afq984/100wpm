class Typer {
  static resetAnimation(element) {
    // https://stackoverflow.com/a/45036752
    element.style.animation = 'none';
    element.offsetHeight; /* trigger reflow */
    element.style.animation = null;
  }

  static calculatePositions(text, wordPos, inputValue) {
    let goodPos = wordPos;
    for (let i = 0; i < inputValue.length; i++) {
      if (text[wordPos + i] == inputValue[i]) {
        goodPos = wordPos + i + 1;
      } else {
        break;
      }
    }
    let pos = wordPos + inputValue.length;
    let shouldClean = false;
    if (text[goodPos - 1] == " " || goodPos == text.length) {
      wordPos = goodPos;
      shouldClean = true;
    }

    return {
      wordPos: wordPos,
      goodPos: goodPos,
      pos: pos,
      shouldClean: shouldClean,
    }
  }

  setDiv(done, bad, todo) {
    this.div.children[0].textContent = done;
    this.div.children[1].textContent = bad;
    this.div.children[2].textContent = todo[0];
    Typer.resetAnimation(this.div.children[2]);
    this.div.children[3].textContent = todo.slice(1);
  }

  updateWpm(n) {
    if (this.t0 === null) {
      this.t0 = Date.now();
      return;
    }
    if (n > 0) {
      this.wpm.textContent = Math.round((n - 1) / 5 * 6e4 / (Date.now() - this.t0));
    }
  }

  constructor(text, div, input, wpm) {
    this.text = text;
    this.div = div;
    this.input = input;
    this.wpm = wpm;
    this.t0 = null;
    this.wordPos = 0;

    this.setDiv("", "", text);
    let self = this;  // do we need self?
    input.addEventListener('input', (event) => {
      let r = Typer.calculatePositions(text, self.wordPos, self.input.value);
      console.log(r);
      if (r.shouldClean) {
        self.input.value = "";
      }
      self.wordPos = r.wordPos;
      self.setDiv(
        text.slice(0, r.goodPos),
        text.slice(r.goodPos, r.pos),
        text.slice(r.pos),
      );
      self.updateWpm(r.goodPos);

      if (r.goodPos == self.text.length) {
        self.input.disabled = true;
      }
    });
  }
}
