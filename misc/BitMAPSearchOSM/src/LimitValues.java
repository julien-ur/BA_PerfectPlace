/**
 * This class regulates the grayscale-limits with regard to the number of chosen
 * amenities. If the user only choose one amenity, the best-match-area should
 * display only the area around this amenity, whereas if the user choose more of
 * the possible amenities, the best-match-area should represent the overlapping area
 * between the amenity-regions. Additionally it's important to consider the
 * different importance-value and integrate them in the limit calculation.
 * 
 * @author Judith Höreth
 * 
 */
public class LimitValues {
	int limitBestMatch, limitSecondMatch, limitThirdMatch;
	AppletValues appV;

	public LimitValues(int limitBestMatch, int limitSecondMatch,
			int limitThirdMatch, AppletValues appV) {
		this.limitBestMatch = limitBestMatch;
		this.limitSecondMatch = limitSecondMatch;
		this.limitThirdMatch = limitThirdMatch;
		this.appV = appV;
	}

	void setLimitValues(int queryCount, int[] countImportance) {
		int impAdd = getImportanceMinusValue(countImportance, queryCount);
		setLimitBestMatch(Values.BEST_MATCH_LIMIT * queryCount +impAdd);
		setLimitSecondMatch(Values.SECOND_MATCH_LIMIT * queryCount+impAdd);
		setLimitThirdMatch(Values.SECOND_MATCH_LIMIT * queryCount);
	}

	private int getImportanceMinusValue(int[] countImportance, int queryCount) {
		int impAdd = 0;
		if (countImportance[2] == queryCount) {
			impAdd = impAdd + 15 * countImportance[2];
		} else if (countImportance[2] > 0 && countImportance[2] < queryCount
				&& countImportance[2] > queryCount / 2) {
			impAdd = impAdd + 10 * countImportance[2];
		} else if (countImportance[2] > 0 && countImportance[2] < queryCount
				&& countImportance[2] <= queryCount / 2) {
			impAdd = impAdd + 5 * countImportance[2];
		}
		if (countImportance[1] == queryCount) {
			impAdd = impAdd + 8 * countImportance[1];
		} else if (countImportance[1] > 0 && countImportance[1] < queryCount
				&& countImportance[1] > queryCount / 2) {
			impAdd = impAdd + 6 * countImportance[1];
		} else if (countImportance[1] > 0
				&& countImportance[1] <= queryCount / 2) {
			impAdd = impAdd + 4 * countImportance[1];
		}
		impAdd = impAdd + (queryCount * 2);
		return impAdd;

	}

	private void setLimitThirdMatch(int limitThirdMatch) {
		this.limitThirdMatch = limitThirdMatch;
	}

	private void setLimitSecondMatch(int limitSecondMatch) {
		this.limitSecondMatch = limitSecondMatch;
	}

	private void setLimitBestMatch(int limitBestMatch) {
		this.limitBestMatch = limitBestMatch;
	}

	int getLimitBestMatch() {
		return limitBestMatch;
	}

	int getLimitSecondMatch() {
		return limitSecondMatch;
	}

	int getLimitThirdMatch() {
		return limitThirdMatch;
	}

}
