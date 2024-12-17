import { useContext, useEffect, useRef } from "react";
import { StatementContext } from "../../StatementCont";
import FollowMeToast from "../followMeToast/FollowMeToast";
import { useParams } from "react-router-dom";
import { Screen, Statement, StatementType } from "delib-npm";
import StatementSettings from "../settings/StatementSettings";

import StatementChat from "../chat/StatementChat";
import Group from "../statementTypes/group/Group";

const Switch = () => {
	const { statement } = useContext(StatementContext);
	const { page } = useParams();

	return (
		<main className="page__main">
			<FollowMeToast />
			<SwitchInner statement={statement} page={page} />
		</main>
	);
};

function SwitchInner({
	statement,
	page,
}: {
  statement: Statement | undefined;
  page: string | undefined;
}) {
	const statementType = statement?.statementType;
	if (page === Screen.SETTINGS) {
		return <StatementSettings />;
	}

	switch (statementType) {
	case StatementType.group:
		return (
			<StatementInner>
				<Group />
			</StatementInner>
		);
	default:
		return (
			<StatementInner>
				<p>test</p>
			</StatementInner>
		);
	}
}

interface StatementInnerProps {
  children: React.ReactNode;
}

function StatementInner({ children }: StatementInnerProps) {
	const scrollableRef = useRef<HTMLDivElement>(null);
	const { statement } = useContext(StatementContext);
	const { page } = useParams();

	useEffect(() => {
		if (page === Screen.CHAT && scrollableRef.current) {
			// Use window.innerWidth instead of div width for consistent scrolling
			scrollableRef.current.scrollTo(-window.innerWidth, 0);
		}
	}, [page]);

	return (
		<div className="statement-inner">
			<div className="simple-wrapper">
				<h1>{statement?.statement}</h1>
			</div>
			<div className="statement-inner__wrapper" ref={scrollableRef}>
				<div className="" style={{ backgroundColor: "pink" }}>
					<p className="page__description">{statement?.description}</p>
					{children}
				</div>
				<StatementChat />
			</div>
		</div>
	);
}

export default Switch;
