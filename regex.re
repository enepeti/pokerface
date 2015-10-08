Kérdéseket tartalmazó csv parsolása mongo-javascriptbe

Régi
^([^;]*);([^;]*);([^;]*);([^;]*)$
db.questions.insert({question:"\1", answers: {correct:"\2", wrong1: "\3", wrong2: "\4"}, asked: false})

Új
^([^;]*);([^;]*);([^;]*);([^;]*);(.)$
db.questions.insert({position: 0, question:"\1", answers: ["\2", "\3", "\4"], correct:\5, asked: false})
