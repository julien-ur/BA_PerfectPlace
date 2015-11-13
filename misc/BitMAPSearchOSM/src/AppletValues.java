import java.util.ArrayList;

/**
 * This class contains getter and setter methods of values which are used in
 * different classes of the program.
 * 
 * @author Judith Höreth
 * 
 */

public class AppletValues {
	private int parameterCount = 0;
	private String code = "beforeSelection";
	private int[] queryType = new int[4];
	private int layerToRefresh = 0;
	private String[] selectedItems = new String[4];
	private ArrayList<String[]> allQueries;
	private int[][] customQuery = new int[4][2];
	private OverlayLabel[] layerLabels;
	private OverlayLabel layer1Label, layer2Label, layer3Label, layer4Label;
	private int[][] queryValues = new int[][] {
			{ 1, Values.VERY_IMPORTANT, Values.GAUSS_BLUR_VALUE },
			{ 1, Values.VERY_IMPORTANT, Values.GAUSS_BLUR_VALUE },
			{ 1, Values.VERY_IMPORTANT, Values.GAUSS_BLUR_VALUE },
			{ 1, Values.VERY_IMPORTANT, Values.GAUSS_BLUR_VALUE } };
	private int countNotImportant = 0, countImportant = 0,
			countVeryImportant = 0;
	int[] importanceCount = new int[] { countNotImportant, countImportant,
			countVeryImportant };
	ArrayList<String> notFired;
	private int zoom;
	String customParameterName;
	private ArrayList<String> addressList;
	private int selectedAddressIndex;
	float[] latLonCustom;

	public AppletValues() {
		layerLabels = new OverlayLabel[] { layer1Label, layer2Label,
				layer3Label, layer4Label };
		notFired = new ArrayList<String>();
	}

	void setParameterCount(int parameterCount) {
		this.parameterCount = parameterCount;
	}

	int getParameterCount() {
		return parameterCount;
	}

	void setCode(String code) {
		this.code = code;
	}

	String getCode() {
		return code;
	}

	void setQueryType(int pos, int value) {
		queryType[pos] = value;
	}

	int[] getQueryType() {
		return queryType;
	}

	void setLayerToRefresh(int layerToRefresh) {
		this.layerToRefresh = layerToRefresh;
	}

	int getLayerToRefresh() {
		return layerToRefresh;
	}

	void setSelectedItems(int pos, String value) {
		selectedItems[pos] = value;
	}

	String[] getSelectedItems() {
		return selectedItems;
	}

	void setAllQueries(ArrayList<String[]> allQueries) {
		this.allQueries = allQueries;
	}

	void removeFromAllQueries(int pos) {
		allQueries.remove(pos);
	}

	void addToAllQueries(String[] content) {
		allQueries.add(content);
	}

	ArrayList<String[]> getAllQueries() {
		return allQueries;
	}

	void setCustomQuery(int pos, int[] content) {
		customQuery[pos] = content;
	}

	int[][] getCustomQuery() {
		return customQuery;
	}

	void setLayerLabels(int pos, OverlayLabel label) {
		layerLabels[pos] = label;
	}

	OverlayLabel[] getLayerLabels() {
		return layerLabels;
	}

	void setQueryValues(int i, int j, int content) {
		queryValues[i][j] = content;
	}

	int[][] getQueryValues() {
		return queryValues;
	}

	int[] getImportanceCount() {
		return importanceCount;
	}

	void setImportanceCount(int pos, int content) {
		importanceCount[pos] = content;
	}

	ArrayList<String> getNotFired() {
		return notFired;
	}

	void addNotFired(String s) {
		notFired.add(s);
	}

	void resetNotFired() {
		notFired = new ArrayList<String>();
	}

	void setZoom(int zoom) {
		this.zoom = zoom;

	}

	int getZoom() {
		return zoom;
	}

	void setCustomParameterName(String customParameterName) {
		this.customParameterName = customParameterName;

	}

	String getCustomParameterName() {
		return customParameterName;
	}

	void setAddressList(ArrayList<String> list) {
		addressList = new ArrayList<String>();
		addressList.addAll(list);
	}

	ArrayList<String> getAddressList() {
		return addressList;
	}

	void setSelectedAddress(int selectedAddressIndex) {
		this.selectedAddressIndex = selectedAddressIndex;
	}

	int getSelectedAddress() {
		return selectedAddressIndex;
	}

	void setLatLonOfCustomParamter(float[] latLonCustom) {
		this.latLonCustom = latLonCustom;
	}

	float[] getLatLonOfCustomParameter() {
		return latLonCustom;
	}
}
