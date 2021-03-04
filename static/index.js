const wpm = document.getElementById("wpm");
const div = document.getElementById("div");
const input = document.getElementById("input");
function resetAnimation(element) {
  // https://stackoverflow.com/a/45036752
  element.style.animation = 'none';
  element.offsetHeight; /* trigger reflow */
  element.style.animation = null;
}
function setDiv(done, bad, todo) {
  div.children[0].textContent = done;
  div.children[1].textContent = bad;
  div.children[2].textContent = todo[0];
  resetAnimation(div.children[2]);
  div.children[3].textContent = todo.slice(1);
}
var goodpos = 0;
var wordpos = 0;
var pos = 0;
var t0 = null;
function inputChanged(event) {
  goodpos = wordpos;
  for (let i = 0; i < input.value.length; i++) {
    let c = input.value[i];
    if (text[wordpos + i] == c) {
      goodpos = wordpos + i + 1;
    } else {
      break;
    }
  }
  pos = wordpos + input.value.length;
  if (text[goodpos - 1] == " " || goodpos == text.length) {
    wordpos = goodpos;
    input.value = "";
    if (goodpos == text.length) {
      input.disabled = true;
    }
  }
  setDiv(text.slice(0, goodpos), text.slice(goodpos, pos), text.slice(pos));

  if (t0 === null) {
    t0 = Date.now();
  }
  else if (goodpos > 0) {
    wpm.textContent = Math.round(
      Math.max(0, goodpos - 1) / 5  // 1 word = 5 chars
      / (Date.now() - t0) * 60000
    );
  }
}
input.addEventListener("input", inputChanged);
window.onload = function initialize() {
  setDiv("", "", text);
  console.log("init");
}
