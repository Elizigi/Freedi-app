import { Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { FireStore } from '../config';
import { store } from '@/model/store';
import { Collections } from '@/types/enums';
import { Statement } from '@/types/statement';
import { getVoteId, Vote, VoteSchema } from '@/types/vote';
import { User } from '@/types/user';
import { parse } from 'valibot';

export async function setVoteToDB(option: Statement) {
	try {
		//vote reference
		const user: User | null = store.getState().user.user;
		if (!user) throw new Error('User not logged in');
		const voteId = getVoteId(user.uid, option.parentId);

		const voteRef = doc(FireStore, Collections.votes, voteId);

		// toggle vote
		const vote: Vote = {
			voteId,
			statementId: option.statementId,
			parentId: option.parentId,
			userId: user.uid,
			lastUpdate: Timestamp.now().toMillis(),
			createdAt: Timestamp.now().toMillis(),
			voter: user,
		};

		const voteDoc = await getDoc(voteRef);
		if (
			voteDoc.exists() &&
			voteDoc.data()?.statementId === option.statementId
		) {
			vote.statementId = 'none';
		}

		const parsedVote = parse(VoteSchema, vote);

		await setDoc(voteRef, parsedVote, { merge: true });
	} catch (error) {
		console.error(error);
	}
}
