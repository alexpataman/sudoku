module.exports = function solveSudoku(matrix) {
  const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let error = false;

  function Variations() {
    this.reduced = 0;
    this._storage = new Map();

    this.getVariations = () => {
      return this._storage;
    }

    this.setVariations = (data) => {
      data.elements.forEach(el => {

        let index = [el[0], el[1]].join('|');
        if (!this._storage.has(index)) {
          this._storage.set(index, [...data.set.values()]);
        } else {
          let intersection = [...this._storage.get(index).values()].filter(x => [...data.set.values()].includes(x));
          if (intersection.length) {
            this._storage.set(index, intersection);
          } else {
            return false;
          }
        }
      });
      return true;
    }

    this.sortVariations = () => {
      this._storage = new Map([...this._storage.entries()].sort(([keyA, valA], [keyB, valB]) => valA.length - valB.length));
    }

    this.updateMatrix = (matrix) => {

      this._storage.forEach((value, key, map) => {
        if (value.length === 1) {
          let row, col;
          [row, col] = key.split('|');
          matrix[row][col] = value[0];
          map.delete(key);
          this.reduced++;
        }
      });

      this.sortVariations();

      return matrix;
    }

    this.getSize = () => {
      return this._storage.size;
    }
  }

  const variations = new Variations();

  for (let i = 0; i < 9; i++) {
    let rowVariations = matrix[i].reduce((acc, v, ind) => {
      if (v === 0) {
        acc.elements.push([i, ind]);
      } else {
        if (acc.set.has(v)) {
          acc.set.delete(v);
        } else {
          error = true;
        }
      }
      return acc;
    }, { 'set': new Set(DIGITS), 'elements': [] });

    if (variations.setVariations(rowVariations)) {
      matrix = variations.updateMatrix(matrix);
    } else {
      error = true;
    }

    let colVariations = matrix.reduce((acc, v, ind) => {
      if (v[i] === 0) {
        acc.elements.push([ind, i]);
      } else {
        if (acc.set.has(v[i])) {
          acc.set.delete(v[i]);
        } else {
          error = true;
        }
      }
      return acc;
    }, { 'set': new Set(DIGITS), 'elements': [] });

    if (variations.setVariations(colVariations)) {
      matrix = variations.updateMatrix(matrix);
    } else {
      error = true;
    }


    let [r, c] = [Math.floor(i / 3) * 3, (i % 3) * 3];
    let sectionVariations = matrix.slice(r, r + 3).reduce((acc, v, ind1) => v.slice(c, c + 3).reduce((acc, v, ind2) => {
      if (v === 0) {
        acc.elements.push([Math.floor(i / 3) * 3 + ind1, (i % 3) * 3 + ind2]);
      } else {
        if (acc.set.has(v)) {
          acc.set.delete(v);
        } else {
          error = true;
        }
      }

      return acc;
    }, acc), { 'set': new Set(DIGITS), 'elements': [] });

    if (variations.setVariations(sectionVariations)) {
      matrix = variations.updateMatrix(matrix);
    } else {
      error = true;
    }

  }


  if (error) {
    return false;
  }

  if (variations.getSize() > 0) {
    if (variations.reduced > 0) {
      return solveSudoku(matrix);
    } else {
      for ([key, value] of variations.getVariations()) {
        let row, col;
        [row, col] = key.split('|');
        for (assumption of value) {
          let attempt = JSON.parse(JSON.stringify(matrix));
          attempt[row][col] = assumption;
          attempt = solveSudoku(attempt);
          if (attempt) {
            return attempt;
          }
        }
        return false;
      }
    }
  } else {
    return matrix;
  }
}
