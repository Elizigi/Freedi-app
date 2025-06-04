import { Statement } from 'delib-npm';
import { FC, useState } from 'react';
import styles from './SearchBar.module.scss';
import { useUserConfig } from '@/controllers/hooks/useUserConfig';
import OptionMCCard from '../deleteCard/OptionMCCard';
import Close from '@/assets/icons/close.svg?react';

interface SearchBarProps {
	options: Statement[];
}

const SearchBar: FC<SearchBarProps> = ({ options }) => {
	const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
	const empty = '';
	const [searchTerm, setSearchTerm] = useState(empty);
	const { t } = useUserConfig();

	if (!isSearchBarOpen) {
		return (
			<button
				className={styles.magnifyingGlass}
				onClick={() => setIsSearchBarOpen(true)}
			>
				⌕
			</button>
		);
	}

	const filteredOptions = options.filter((option) =>
		option.statement.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className={styles.searchContainer}>
			<div className={styles.inlineInput}>
				<input
					className={styles.searchInput}
					type='search'
					placeholder={t('Search suggestions...')}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<Close
					className={styles.XBtn}
					onClick={() => setIsSearchBarOpen(false)}
				></Close>
			</div>
			{<h3>{t('Search results')}</h3>}
			{searchTerm != empty &&
				filteredOptions?.map((option) => (
					<OptionMCCard
						key={option.statementId}
						statement={option}
						isDelete={false}
					/>
				))}
			<hr />
		</div>
	);
};

export default SearchBar;
