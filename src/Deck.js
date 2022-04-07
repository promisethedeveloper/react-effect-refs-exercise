import React, { useState, useEffect, useRef } from "react";
import Card from "./Card";
import axios from "axios";
import "./Deck.css";

const API_BASE_URL = "http://deckofcardsapi.com/api/deck";

const Deck = () => {
	const [deck, setDeck] = useState(null);
	const [drawn, setDrawn] = useState([]);
	const [autoDraw, setAutoDraw] = useState(false);
	const timerRef = useRef(null);

	// At mount or first render, load deck from API into the state
	useEffect(() => {
		const getData = async () => {
			let res = await axios.get(`${API_BASE_URL}/new/shuffle`);
			setDeck(res.data);
		};
		getData();
	}, [setDeck]);

	// Draw one card every second if autoDraw is true
	useEffect(() => {
		const getCard = async () => {
			let { deck_id } = deck;

			try {
				let drawRes = await axios.get(`${API_BASE_URL}/${deck_id}/draw`);

				if (drawRes.data.remaining === 0) {
					setAutoDraw(false);
					throw new Error("No cards remaining!");
				}

				const card = drawRes.data.cards[0];

				setDrawn((d) => [
					...d,
					{
						id: card.code,
						name: card.suit,
						image: card.image,
					},
				]);
			} catch (error) {
				alert(error);
			}
		};

		if (autoDraw && !timerRef.current) {
			timerRef.current = setInterval(async () => {
				await getCard();
			}, 1000);
		}

		return () => {
			clearInterval(timerRef.current);
			timerRef.current = null;
		};
	}, [autoDraw, setAutoDraw, deck]);

	const toggleAutoDraw = () => {
		setAutoDraw((auto) => !auto);
	};

	const cards = drawn.map((c) => (
		<Card key={c.id} name={c.name} image={c.image} />
	));

	return (
		<div className="Deck">
			{deck ? (
				<button className="Deck-gimme" onClick={toggleAutoDraw}>
					{autoDraw ? "STOP" : "KEEP"} DRAWING FOR ME!
				</button>
			) : null}
			<div className="Deck-cardarea">{cards}</div>
		</div>
	);
};

export default Deck;
