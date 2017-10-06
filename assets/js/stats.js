'use strict'

var defaultSkill = function () { return [25.0, 25.0 / 3.0] }

var playerStats = function (games) {
  return games
    .sort(function (a, b) { return a.datetime - b.datetime })
    .reduce(function (a, doc) {
      var p1 = a[doc.player1] || (a[doc.player1] = {win: 0, lose: 0, total: 0, skill: defaultSkill()})
      var p2 = a[doc.player2] || (a[doc.player2] = {win: 0, lose: 0, total: 0, skill: defaultSkill()})
      p1[doc.player1 === doc.winner ? 'win' : 'lose']++
      p2[doc.player2 === doc.winner ? 'win' : 'lose']++
      p1.total++
      p2.total++

      p1.rank = doc.player1 === doc.winner ? 1 : 2
      p2.rank = doc.player2 === doc.winner ? 1 : 2

      trueskill.AdjustPlayers([p1, p2])

      return a
    }, {})
}

var skillLevel = function (s) {
  return s[0] - 3 * s[1]
}

var db = PouchDB('https://dotnetmentor.cloudant.com/king-of-pong/', {
  auth: {
    username: 'ltionttergaveizandsomese',
    password: '97d6d1056e61077b5e016aefa8de34e80767ede2'
  }
})

db.allDocs({
    startkey: 'game/',
    endkey: 'game/\uffff',
    include_docs: true
  })
  .then(function (userDocs) {
    return userDocs.rows.map(function (row) {
      var doc = row.doc
      return {
        player1: doc.player1,
        player2: doc.player2,
        winner: doc.winner,
        datetime: doc.datetime
      }
    })
  })
  .then(function (games) {
    var stats = playerStats(games)
    var playerIds = Object.keys(stats)

    playerIds
      .sort(function (a, b) {
        var s1 = skillLevel(stats[a].skill)
        var s2 = skillLevel(stats[b].skill)

        return s2 - s1
      })
      .forEach(function (id, i) {
        stats[id].order = i
      })

    document.querySelectorAll('.pong-stat').forEach(function (statEl, i) {
      var id = statEl.getAttribute('data-id')
      var playerStats = stats[id]
      statEl.innerHTML = (playerStats.skill[0] - playerStats.skill[1] * 3).toFixed(1) +
        (playerStats.order === 0 ? '&nbsp;<i class="material-icons" title="King of Pong">grade</i>' : '')
    })
  })
