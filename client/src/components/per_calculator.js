function cardGroupFinder(cards) {
    const cardGroups = [];
    let currentGroup = [];

    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        if (card !== 0) {
            currentGroup.push(card);
        }

        if (card === 0 || i === cards.length - 1) {
            if (currentGroup.length >= 3) {
                cardGroups.push(currentGroup);
            }
            currentGroup = [];
        }
    }

    return cardGroups;
}

