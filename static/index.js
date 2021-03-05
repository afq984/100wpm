class Typer {
  static resetAnimation(element) {
    // https://stackoverflow.com/a/45036752
    element.style.animation = 'none';
    element.offsetHeight; /* trigger reflow */
    element.style.animation = null;
  }

  static calculatePositions(text, wordBegin, inputValue) {
    let goodPos = wordBegin;
    for (let i = 0; i < inputValue.length; i++) {
      if (text[wordBegin + i] == inputValue[i]) {
        goodPos = wordBegin + i + 1;
      } else {
        break;
      }
    }

    let wordEnd = wordBegin;
    for (; wordEnd < text.length; wordEnd++) {
      if (text[wordEnd] == " ") {
        break;
      }
    }

    let pos = wordBegin + inputValue.length;
    let shouldClean = false;
    if (text[goodPos - 1] == " " || goodPos == text.length) {
      wordBegin = goodPos;
      shouldClean = true;
    }

    return {
      wordBegin: wordBegin,
      wordEnd: wordEnd,
      goodPos: goodPos,
      pos: pos,
      shouldClean: shouldClean,
    }
  }

  setDiv(wordBegin, wordEnd, goodPos, pos) {
    let setText = (name, value) => {
      this.div.querySelector(`[name="${name}"]`).textContent = value;
    }
    setText("a", this.text.slice(0, wordBegin));
    setText("b", this.text.slice(wordBegin, goodPos));
    setText("c", this.text.slice(goodPos, Math.min(pos, wordEnd)));
    setText("d", this.text.slice(wordEnd, pos));
    setText("e", this.text.slice(pos, wordEnd));
    setText("f", this.text.slice(Math.max(pos, wordEnd)));
    Typer.resetAnimation(this.div.querySelector(".cursor"));
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

    this.setDiv(0, 0, 0, 0);
    let self = this;  // do we need self?
    input.addEventListener('input', (event) => {
      let r = Typer.calculatePositions(text, self.wordPos, self.input.value);
      console.log(r);
      if (r.shouldClean) {
        self.input.value = "";
      }
      self.wordPos = r.wordBegin;
      self.setDiv(
        r.wordBegin,
        r.wordEnd,
        r.goodPos,
        r.pos,
      );
      self.updateWpm(r.goodPos);

      if (r.goodPos == self.text.length) {
        self.input.disabled = true;
      }
    });
  }
}
