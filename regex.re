^([^;]*);([^;]*);([^;]*);([^;]*)$
db.questions.insert({question:"\1", answers: {correct:"\2", wrong1: "\3", wrong2: "\4"}, asked: false})