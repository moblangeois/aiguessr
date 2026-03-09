// Exporte les donnees de la partie en JSON
export function exportGameToJSON(gameData) {
  const {
    date = new Date().toISOString(),
    groups,
    scores,
    questions,
    answers,
    timerDuration,
    questionnaireResponses = []
  } = gameData;

  // Calculer les statistiques
  const statistics = calculateStatistics(groups, answers, questions);

  const exportData = {
    metadata: {
      version: '1.0',
      exportDate: date,
      application: 'AIGuessr',
      title: "L'IA, plus materielle qu'on ne le pense"
    },
    game: {
      timerDuration,
      totalQuestions: questions.length,
      groups,
      scores
    },
    questions: questions.map(q => ({
      id: q.id,
      question: q.question,
      category: q.category,
      target: {
        name: q.target.name,
        lat: q.target.lat,
        lng: q.target.lng
      },
      explanation: q.explanation
    })),
    questionnaireResponses: questionnaireResponses.map(r => ({
      groupName: r.groupName,
      phase: r.phase,
      timestamp: r.timestamp,
      responses: r.responses,
      openResponse: r.openResponse || null
    })),
    answers: Object.entries(answers).reduce((acc, [questionId, questionAnswers]) => {
      acc[questionId] = Object.entries(questionAnswers).reduce((ansAcc, [groupName, data]) => {
        ansAcc[groupName] = {
          lat: data.lat,
          lng: data.lng,
          distance: data.distance,
          points: data.points
        };
        return ansAcc;
      }, {});
      return acc;
    }, {}),
    statistics
  };

  return exportData;
}

// Calcule les statistiques de la partie
function calculateStatistics(groups, answers, questions) {
  const stats = {
    byCategory: {},
    byGroup: {},
    overall: {
      averageDistance: 0,
      totalAnswers: 0,
      bestAnswer: null,
      worstAnswer: null
    }
  };

  // Initialiser les categories
  const categories = ['extraction', 'production', 'datacenter', 'dechets'];
  categories.forEach(cat => {
    stats.byCategory[cat] = {
      questionsCount: 0,
      answersCount: 0,
      averageDistance: 0,
      totalDistance: 0
    };
  });

  // Initialiser les groupes
  groups.forEach(group => {
    stats.byGroup[group] = {
      answersCount: 0,
      averageDistance: 0,
      totalDistance: 0,
      totalPoints: 0,
      bestCategory: null,
      worstCategory: null,
      categoryStats: {}
    };
    categories.forEach(cat => {
      stats.byGroup[group].categoryStats[cat] = {
        answersCount: 0,
        totalDistance: 0,
        averageDistance: 0
      };
    });
  });

  // Compter les questions par categorie
  questions.forEach(q => {
    if (stats.byCategory[q.category]) {
      stats.byCategory[q.category].questionsCount++;
    }
  });

  // Calculer les statistiques
  let totalDistance = 0;
  let totalAnswers = 0;
  let bestDistance = Infinity;
  let worstDistance = 0;

  Object.entries(answers).forEach(([questionId, questionAnswers]) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const category = question.category;

    Object.entries(questionAnswers).forEach(([groupName, data]) => {
      const distance = data.distance;
      const points = data.points;

      // Global
      totalDistance += distance;
      totalAnswers++;

      if (distance < bestDistance) {
        bestDistance = distance;
        stats.overall.bestAnswer = { groupName, questionId, distance, points };
      }
      if (distance > worstDistance) {
        worstDistance = distance;
        stats.overall.worstAnswer = { groupName, questionId, distance, points };
      }

      // Par categorie
      if (stats.byCategory[category]) {
        stats.byCategory[category].answersCount++;
        stats.byCategory[category].totalDistance += distance;
      }

      // Par groupe
      if (stats.byGroup[groupName]) {
        stats.byGroup[groupName].answersCount++;
        stats.byGroup[groupName].totalDistance += distance;
        stats.byGroup[groupName].totalPoints += points;

        if (stats.byGroup[groupName].categoryStats[category]) {
          stats.byGroup[groupName].categoryStats[category].answersCount++;
          stats.byGroup[groupName].categoryStats[category].totalDistance += distance;
        }
      }
    });
  });

  // Calculer les moyennes
  stats.overall.averageDistance = totalAnswers > 0 ? Math.round(totalDistance / totalAnswers) : 0;
  stats.overall.totalAnswers = totalAnswers;

  categories.forEach(cat => {
    const catStats = stats.byCategory[cat];
    if (catStats.answersCount > 0) {
      catStats.averageDistance = Math.round(catStats.totalDistance / catStats.answersCount);
    }
  });

  groups.forEach(group => {
    const groupStats = stats.byGroup[group];
    if (groupStats.answersCount > 0) {
      groupStats.averageDistance = Math.round(groupStats.totalDistance / groupStats.answersCount);
    }

    // Calculer meilleure/pire categorie
    let bestCatDist = Infinity;
    let worstCatDist = 0;

    categories.forEach(cat => {
      const catStats = groupStats.categoryStats[cat];
      if (catStats.answersCount > 0) {
        catStats.averageDistance = Math.round(catStats.totalDistance / catStats.answersCount);

        if (catStats.averageDistance < bestCatDist) {
          bestCatDist = catStats.averageDistance;
          groupStats.bestCategory = cat;
        }
        if (catStats.averageDistance > worstCatDist) {
          worstCatDist = catStats.averageDistance;
          groupStats.worstCategory = cat;
        }
      }
    });
  });

  return stats;
}

// Telecharge le JSON
export function downloadJSON(data, filename = 'aiguessr-export.json') {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
