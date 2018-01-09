/* global xstream CycleDOM Cycle anime puzzles shuffle */

const {default: xs} = xstream // https://github.com/staltz/xstream
const {makeDOMDriver, h} = CycleDOM
const {run} = Cycle

const range = (n) => new Array(n).fill().map((_, i) => i)
const zeroes = (d, ...ds) => !d ? 0 : new Array(d).fill().map(() => zeroes(...ds))
const shuffleArray = (array) => {
  let currentIndex = array.length
  let temporaryValue
  let randomIndex
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array
}

const winanimate = () => {
  const target = document.querySelector('#winner')
  const seq = anime.timeline({
    autoplay: true
  })
  seq
    .add(anime({
      targets: '#winner',
      opacity: [0, 1],
      duration: 200,
      easing: 'easeInQuad'
    }))
    .add(anime({
      targets: '#winner > h1',
      scale: [0, 1],
      duration: 2000,
      easing: 'easeOutQuad',
      offset: -300,
    }))
  seq.begin = function () {
    // target.querySelector('.video').play() // This won't work as it's not immediately being called upon user interaction! Security rules.
    target.style.display = 'grid' // Otherwise the element obscures the actual game even when transparent.
  }
  target.querySelector('.video').play()
}
// TODO: Likewise, handle playing and stopping of the dog-slap video, else the screen stays on.

{
  // NOTE: Consider using anime.js!
  const menu = document.querySelector('#menu')
  const icon = document.querySelector('#icon')
  icon.addEventListener('pointerup', () => {
    menu.style.display = 'block'
  })
  const menuClose = () => {
    setTimeout(() => { menu.style.display = 'none' }, 20) // Needed because of the mobile click passthrough bug.
  }
  const overlay = document.querySelector('#menu .overlay')
  overlay.addEventListener('pointerup', menuClose)
  const about = document.querySelector('#about')
  about.addEventListener('pointerup', () => {
    about.style.display = 'none'
  })
  const aboutbutton = menu.querySelector('.about')
  aboutbutton.addEventListener('pointerup', () => {
    about.style.display = 'grid'
  })
  const how = document.querySelector('#how')
  how.addEventListener('pointerup', () => {
    how.style.display = 'none'
  })
  const howbutton = menu.querySelector('.how')
  howbutton.addEventListener('pointerup', () => {
    how.style.display = 'grid'
  })
  const win = document.querySelector('#winner')
  win.addEventListener('pointerup', () => {
    win.style.opacity = 0
    win.style.display = 'none'
    win.querySelector('.video').pause()
    // win.querySelector('.video').fastSeek(0) // Doesn't work on Chrome yet!
  })
  const sidebar = document.querySelector('.sidebar')
  sidebar.addEventListener('pointerup', menuClose)
}

const main = ({DOM, COMMAND}) => {
  /* Intent */

  const change$ = DOM
    .select(`x-cell`)
    .events('valueChanged')
    .map(({target, detail}) => ({
      x: parseInt(target.dataset.x),
      y: parseInt(target.dataset.y),
      value: parseInt(detail.value)
    }))
    .filter(({value}) => !isNaN(value))

  const movement$ = xs.merge(
    DOM.select('.sudoku').events('keydown')
      .map(({keyCode}) => {
        switch (keyCode) {
          case 37:
            return {x: 0, y: -1}
          case 38:
            return {x: -1, y: 0}
          case 39:
            return {x: 0, y: 1}
          case 40:
            return {x: 1, y: 0}
          default:
            return {x: 0, y: 0}
        }
      })
      .map(m => {
        m.inc = true
        return m
      }),
    DOM.select('x-cell').events('pointerup')
      .map(({target}) => ({inc: false, x: parseInt(target.dataset.x), y: parseInt(target.dataset.y)}))
  )
  const newpuzzle$ = COMMAND
    .filter(({type}) => type === 'new')
    .map(({data}) => data)
    .startWith('load')

  const hint$ = COMMAND
    .filter(({type}) => type === 'hint')

  /* Model */

  const makeBoard = (unsolved) => unsolved.map((line) => line.map((d) => ({value: d, given: !!d, err: false})))
  const checkConflict = (board) => {
    // reset
    for (let i of board) {
      for (let j of i) {
        j.err = false
      }
    }

    // Space-efficient and time-inefficient implementation
    // check rowwise
    for (let row of board) {
      let values = range(10).map(_ => [])
      for (let i in row) values[row[i].value].push(i)
      for (let j = 1; j < values.length; j++) {
        if (values[j].length > 1) {
          for (let k of values[j]) row[k].err = true
        }
      }
    }
    // check coloumnwise
    for (let i = 0; i < 9; i++) {
      let values = range(10).map(_ => [])
      for (let j = 0; j < 9; j++) {
        values[board[j][i].value].push(j)
      }
      for (let k = 1; k < values.length; k++) {
        if (values[k].length > 1) {
          for (let m of values[k]) board[m][i].err = true
        }
      }
    }
    // check supercellwise
    for (let i = 0; i < 9; i += 3) {
      for (let j = 0; j < 9; j += 3) {
        let values = range(10).map(_ => [])
        for (let k = i; k < i + 3; k++) {
          for (let l = j; l < j + 3; l++) {
            values[board[k][l].value].push([k, l])
          }
        }
        for (let x = 1; x < values.length; x++) {
          if (values[x].length > 1) {
            for (let m of values[x]) board[m[0]][m[1]].err = true
          }
        }
      }
    }

    /* // Time-efficient space-inefficient implementation
    let collisions = {
      rowwise:       zeroes(9, 10).map(_ => _.map(_ => [])),
      colwise:       zeroes(9, 10).map(_ => _.map(_ => [])),
      supercellwise: zeroes(9, 10).map(_ => _.map(_ => [])),
    }
    for (let row in board)
      for (let col in board[row]) {
        let cell = board[row][col]
        collisions.rowwise[row][cell.value].push(cell)
        collisions.colwise[col][cell.value].push(cell)
        collisions.supercellwise[(row/3|0)*3 + col/3|0][cell.value].push(cell)
      }
    for (let sets in collisions)
      for (let set of collisions[sets])
        for (let i = 1; i < set.length; i++)
          if (set[i].length > 1)
            for (let cell of set[i]) cell.err = true */

    return board
  }

  // Every time a new puzzle is requested...
  const board$ = newpuzzle$.map((difficulty) => {
    // ...we create a new stream of board$ that change$.
    const load = window.localStorage.getItem('board')
    let puzzle
    if (difficulty === 'load') {
      puzzle = shuffle(puzzles.easy)
      puzzle.unsolved = load !== null ? JSON.parse(load) : makeBoard(puzzle.unsolved)
    } else {
      puzzle = shuffle(puzzles[difficulty])
      puzzle.unsolved = makeBoard(puzzle.unsolved)
    }
    const changeHint$ = xs.merge(change$, hint$)
      .debug()
    return changeHint$.fold(
      (puzzle, {x, y, value, type}) => {
        if (type) {
          const {x, y} = shuffleArray(puzzle.unsolved
            .map((row, x) => row.slice(0).map(({value, given, err}, y) => ({value, given, err, x, y})))
            .reduce((a, b) => a.concat(b), [])
            .filter(({value, given, err}) => (!given && (err || !value)))
          )[0]
          puzzle.unsolved[x][y].value = puzzle.solved[x][y]
        } else {
          puzzle.unsolved[x][y].value = value
        }
        return {solved: puzzle.solved, unsolved: checkConflict(puzzle.unsolved)}
      },
      puzzle
    )
  }).flatten()

  const focuse$ = movement$
    .fold((focus, movement) => {
      if (movement.inc) {
        return {
          x: (focus.x + movement.x + 9) % 9,
          y: (focus.y + movement.y + 9) % 9
        }
      } else {
        return {
          x: movement.x,
          y: movement.y
        }
      }
    }, {x: 4, y: 4})
    // .debug()

  /* View */

  const vdom$ = board$.map(
    (puzzle) => h('div.sudoku',
      puzzle.unsolved
        .reduce((a, b) => a.concat(b), []) // flatten board
        .map(({value, given, err}, i) => h('x-cell', {
          attrs: {
            'data-x': i / 9 | 0, // Decided to put coords in data,
            'data-y': i % 9, // makes no diff than calculating it during 'intent' really
            'err': err, // Flagging errors in custom attr instead of class to preserve focus
            'value': value,
            'disabled': given
          }
        }))
    )
  )

  return {
    DOM: vdom$,
    FOCUS: focuse$.map(({x, y}) => 1 + x * 9 + y),
    STORE: board$.map(puzzle => puzzle.unsolved),
    WIN: board$.filter(({unsolved}) => {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (unsolved[i][j].value === 0 || unsolved[i][j].err) { return false }
        }
      }
      return true
    })
  }
}

const drivers = {
  DOM: makeDOMDriver('#container'),
  FOCUS: (focuse$) => { // Custom driver to focus elements.
    focuse$.subscribe({
      next: i => {
        const cell = document.querySelector(`#container .sudoku x-cell:nth-child(${i})`)
        cell.focus()
      },
      error: () => {},
      complete: () => {}
    })
  },
  STORE: (board$) => {
    board$.subscribe({
      next: board => {
        const key = 'board'
        const val = JSON.stringify(board)
        window.localStorage.setItem(key, val)
      },
      error: () => {},
      complete: () => {}
    })
  },
  WIN: (board$) => {
    board$.subscribe({
      next: board => {
        setTimeout(winanimate, 200)
        window.localStorage.removeItem('board')
      },
      error: () => {},
      complete: () => {}
    })
  },
  COMMAND: () => {
    const $newEasy = document.getElementById('neweasy')
    const $newModerate = document.getElementById('newmoderate')
    const $newHard = document.getElementById('newhard')
    const $hint = document.getElementById('hint')

    const source = xs.create({
      start: listener => {
        this.callback = ({target}) => {
          if (target.id === 'neweasy') return listener.next({type: 'new', data: 'easy'})
          if (target.id === 'newmoderate') return listener.next({type: 'new', data: 'medium'})
          if (target.id === 'newhard') return listener.next({type: 'new', data: 'hard'})
          if (target.id === 'hint') return listener.next({type: 'hint'})
        }
        $newEasy.addEventListener('pointerup', this.callback)
        $newModerate.addEventListener('pointerup', this.callback)
        $newHard.addEventListener('pointerup', this.callback)
        $hint.addEventListener('pointerup', this.callback)
      },
      stop: listener => {
        $newEasy.removeEventListener('pointerup', this.callback)
        $newModerate.removeEventListener('pointerup', this.callback)
        $newHard.removeEventListener('pointerup', this.callback)
        $hint.removeEventListener('pointerup', this.callback)
      }
    })
    return source
  }
}

run(main, drivers)

const preventMotion = (event) => {
  window.scrollTo(0, 0)
  event.preventDefault()
  event.stopPropagation()
}
window.addEventListener('scroll', preventMotion, false)
window.addEventListener('touchmove', preventMotion, false)
