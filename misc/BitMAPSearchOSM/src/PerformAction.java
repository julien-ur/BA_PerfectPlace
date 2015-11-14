import java.awt.Color;
import java.awt.event.MouseListener;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.Scanner;

import javax.swing.JComboBox;
import javax.swing.JFrame;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * This class is used to summarize the methods which perform the actions after
 * an interaction of the user with an element of the User Interface
 * 
 * @author Judith Höreth
 * 
 */
public class PerformAction {
	UserInterface ui;
	AppletValues appV;
	MouseListener mL;
	Date date;

	public PerformAction(UserInterface ui, AppletValues appV, MouseListener mL) {
		this.ui = ui;
		this.appV = appV;
		this.mL = mL;
		date = new Date();
	}

	/**
	 * This method is called when a new parameter is created. It first checks,
	 * if there are already four parameters created. If not, a dialog is
	 * displayed, in which the user can decide, whether he wants to create a
	 * positive or negative parameter.
	 */
	void newParamterAction() {
		if (appV.getParameterCount() > ui.getAllParameterPanels().size() - 1) {
			Dialog dialogTooMuchParameter = new Dialog(new JFrame(),
					TextValues.TOO_MUCH_PARAMETER_TITLE, appV);
			dialogTooMuchParameter.show(TextValues.TOO_MUCH_PARAMETER_TEXT,
					TextValues.OK_BUTTON, null, Values.DIALOG_WITHOUT_ANY);
		} else {
			Dialog dialog = new Dialog(new JFrame(),
					TextValues.NEW_PARAMETER_TITLE, appV);
			dialog.show(TextValues.NEW_PARAMETER_TEXT,
					TextValues.PARAMETER_POSITVE_BUTTON,
					TextValues.PARAMETER_NEGATIVE_BUTTON,
					Values.DIALOG_WITHOUT_ANY);
			Color color = new Color(0x000000);
			String distance = "";
			int value = 0;
			if (dialog.getParameter() == Values.POSITIVE) {
				color = new Color(0x008000);
				value = Values.POSITIVE;
				distance = TextValues.DISTANCE_SLIDER_TEXT_POS;
			} else if (dialog.getParameter() == Values.NEGATIVE) {
				color = new Color(0x800000);
				value = Values.NEGATIVE;
				distance = TextValues.DISTANCE_SLIDER_TEXT_NEG;
			}
			if (value != 0) {
				int panelVisible = 0;
				for (int i = 0; i < ui.getAllParameterPanels().size(); i++) {
					if (ui.getAllParameterPanels().get(i).isVisible() == false) {
						panelVisible = i;
						appV.setQueryType(i, value);
						ui.getDistanceLabels().get(i).setText(distance);
						break;
					}
				}
				appV.setImportanceCount(2, appV.getImportanceCount()[2] + 1);
				ui.getAllParameterPanels().get(panelVisible).setVisible(true);
				ui.getAllParameterPanels().get(panelVisible)
						.setBackground(color);
				appV.setParameterCount(appV.getParameterCount() + 1);
				ui.setCheckBoxes(appV.getParameterCount(), appV.getZoom());
			}
		}
	}

	/**
	 * If the user clicks on the delete button, the selected parameter is
	 * deleted and the chosen values of it are deleted as well.
	 * 
	 * @param i
	 *            the position of the parameter which should be deleted
	 */
	void deleteAction(int i) {
		appV.addNotFired("check");
		appV.addNotFired("combo");
		ui.getAllParameterPanels().get(i).setVisible(false);
		appV.setParameterCount(appV.getParameterCount() - 1);
		appV.setLayerToRefresh(i);
		appV.setSelectedItems(i, null);
		ui.refreshPanel(i);
		appV.setQueryType(i, 0);
		for (int j = 0; j < appV.getAllQueries().size(); j++) {
			if (Integer.valueOf(appV.getAllQueries().get(j)[1]) == i) {
				appV.removeFromAllQueries(j);
				j--;
			}
		}
		int importance = appV.getQueryValues()[i][1];
		appV.setImportanceCount(importance,
				appV.getImportanceCount()[importance] - 1);
		appV.setCustomQuery(appV.getLayerToRefresh(), null);
		ui.refreshCheckBoxes(appV.getLayerToRefresh(), null);
		appV.getLayerLabels()[appV.getLayerToRefresh()].removeMouseListener(mL);
	}

	/**
	 * This method is fired when a user selects a category of a parameter. The
	 * selected item is saved and a method is called to set the appropriate
	 * checkboxes to select an amenity of the chosen category. If the category
	 * "Own location" is selected, a dialog is displayed to give the user the
	 * possibility to locate the wished location by entering an address.
	 * 
	 * @param cb
	 *            selected category
	 * @param vA
	 *            ValueAttributon object to use methods of this class
	 * @param mI
	 *            MapInformation object to use methods of this class
	 */
	void comboAction(JComboBox<String> cb, ValueAttribution vA,
			MapInformation mI) {
		String item = cb.getSelectedItem().toString();
		int pos = Integer.valueOf(cb.getParent().getParent().getParent()
				.getName());
		if (ui.getAllParameterPanels().get(pos).isVisible() == true) {
			if (item.equals(QueryValues.AMENITIES[QueryValues.AMENITIES.length - 1])) {
				Dialog dialog = new Dialog(new JFrame(),
						TextValues.CUSTOM_PARAMETER_TITLE, appV);
				dialog.show(TextValues.CUSTOM_PARAMETER_TEXT,
						TextValues.OK_BUTTON, null,
						Values.DIALOG_WITH_TEXTFIELD);
				if (dialog.getParameter() == Values.POSITIVE) {
					appV.getLayerLabels()[appV.getLayerToRefresh()]
							.addMouseListener(mL);
					if (dialog.getCustomParameterName() != null) {
						try {
							searchCustomParameterAddress(
									dialog.getCustomParameterName(), mI);
						} catch (IOException e) {
							e.printStackTrace();
						}
					}
				}
			} else {
				appV.getLayerLabels()[appV.getLayerToRefresh()]
						.removeMouseListener(mL);
				appV.setCustomQuery(pos, null);
			}
			appV.setSelectedItems(pos, item);
			appV.setLayerToRefresh(pos);
			removeFromQuery(pos);
			ui.refreshCheckBoxes(pos, vA.getSubAmenities(item));
		}

	}

	/**
	 * If the user clicks the button to return to the map, a restart action is
	 * fired to reset all configurations the user did for the current map
	 * extract.
	 */
	void restartAction() {
		ui.getMapPanel().setVisible(true);
		ui.getLayeredPane().setVisible(false);
		ui.getStartPanel().setVisible(true);
		ui.getQueryPanel().setVisible(false);
		for (int i = 0; i < ui.getAllParameterPanels().size(); i++) {
			ui.getAllParameterPanels().get(i).setVisible(false);
		}
		ui.getLayeredPane().removeAll();
		for (int i = 0; i < ui.getAllParameterPanels().size(); i++) {
			ui.refreshCheckBoxes(i, null);
			ui.refreshPanel(i);
			appV.setSelectedItems(i, null);
			appV.setQueryType(i, 0);
			appV.getLayerLabels()[i].removeMouseListener(mL);
			appV.setCustomQuery(i, null);
			removeFromQuery(i);
		}
		appV.setParameterCount(0);
	}

	void removeFromQuery(int i) {
		for (int j = 0; j < appV.getAllQueries().size(); j++) {
			if (Integer.valueOf(appV.getAllQueries().get(j)[1]) == i) {
				appV.removeFromAllQueries(j);
				j--;
			}
		}
	}

	/**
	 * Creation of the help dialog, which is fired when the user click on the
	 * help button.
	 */
	void helpAction() {
		Dialog dialog = new Dialog(new JFrame(), TextValues.HELP_TITLE, appV);
		dialog.show(TextValues.HELP_TEXT, TextValues.OK_BUTTON, null,
				Values.DIALOG_WITHOUT_ANY);
	}

	/**
	 * The user can use a search function in the program to look for a specific
	 * location or address. This can be at the beginning of the program or in
	 * the function "Own Location". This methods sends a request to the
	 * "nominatim" server, when the user searches a location in the
	 * "Own location" category. The processing of the result is the same as in
	 * the search of a location at the beginning of the map, that's why the rest
	 * of the searching steps are in the method "processUrl(...)", which handle
	 * both searches.
	 * 
	 * @param customParameterName
	 *            search String
	 * @param mI
	 *            object of MapInformation class to call methods of it
	 * @throws IOException
	 */
	private void searchCustomParameterAddress(String customParameterName,
			MapInformation mI) throws IOException {
		customParameterName = adaptSearchString(customParameterName);
		Bounds bounds = mI.getBounds();
		String s = "http://nominatim.openstreetmap.org/search?format=json&limit=5&viewbox="
				+ bounds.getMinlon()
				+ ","
				+ bounds.getMinlat()
				+ ","
				+ bounds.getMaxlon()
				+ ","
				+ bounds.getMaxlat()
				+ "&bounded=1=&q=" + customParameterName;
		URL url;
		url = new URL(s);
		processUrl(url, customParameterName, null);
	}

	/**
	 * The user can use a search function in the program to look for a specific
	 * location or address. This can be at the beginning of the program or in
	 * the function "Own Location". This methods sends a request to the
	 * "nominatim" server, when the user searches a location at the beginning of
	 * the program to choos a map extract after.The processing of the result is
	 * the same as in the search of a location at the beginning of the map,
	 * that's why the rest of the searching steps are in the method
	 * "processUrl(...)", which handle both searches.
	 * 
	 * @param map
	 *            current map object
	 * @throws IOException
	 */
	public void searchAction(Map map) throws IOException {
		String searchLocation = ui.getSearchBox().getText();
		searchLocation = adaptSearchString(searchLocation);
		String s = "http://nominatim.openstreetmap.org/search?format=json&limit=5&q="
				+ searchLocation;
		URL url;
		url = new URL(s);
		processUrl(url, searchLocation, map);
	}

	/**
	 * To be recognized by "nominatim", specific letters used in german language
	 * have to be replaced.
	 * 
	 * @param searchString
	 *            current searchString
	 * @return new searchString with replaced letters
	 */
	private String adaptSearchString(String searchString) {
		searchString = searchString.replaceAll("\\s+", "+");
		searchString = searchString.replaceAll("ß", "ss");
		searchString = searchString.replaceAll("ö", "oe");
		searchString = searchString.replaceAll("ü", "ue");
		searchString = searchString.replaceAll("ä", "ae");
		return searchString;
	}

	/**
	 * This method processes the second part of the search function. The URL
	 * retrieved from the "nominatim" server is read and the wished information
	 * are extracted. All extracted results are displayed in a dialog in order
	 * to present the user a selection of possible locations.If there is any
	 * problem with the search, a dialog is shown.
	 * 
	 * @param url
	 *            url which contains the results
	 * @param searchString
	 *            current searchString
	 * @param map
	 *            map Object to be able to call the method "setCenterPosition"
	 * @throws IOException
	 */
	private void processUrl(URL url, String searchString, Map map)
			throws IOException {
		ArrayList<String> addressList = new ArrayList<String>();
		Scanner scan = new Scanner(url.openStream());
		String str = new String();
		while (scan.hasNext())
			str += scan.nextLine();
		scan.close();
		JSONArray foundRes = new JSONArray(str);
		for (int i = 0; i < foundRes.length(); i++) {
			JSONObject obj = foundRes.getJSONObject(i);
			addressList.add(obj.getString("display_name"));
		}
		appV.setAddressList(addressList);
		if (addressList.size() != 0) {
			Dialog dialog = new Dialog(new JFrame(),
					TextValues.ADDRESS_RESULT_TITLE, appV);
			dialog.show(TextValues.ADDRESS_RESULT_TEXT, TextValues.OK_BUTTON,
					null, Values.DIALOG_WITH_LIST);
			if (dialog.getParameter() == Values.POSITIVE) {
				JSONObject obj = foundRes.getJSONObject(appV
						.getSelectedAddress());
				if (map == null) {
					float[] latLonCustom = new float[] {
							Float.valueOf(obj.getString("lat")),
							Float.valueOf(obj.getString("lon")) };
					appV.setLatLonOfCustomParamter(latLonCustom);
				} else {
					JSONArray res = obj.getJSONArray("boundingbox");
					map.setCenterPosition(
							(Float.valueOf(res.getString(0)) + Float
									.valueOf(res.getString(1))) / 2, (Float
									.valueOf(res.getString(2)) + Float
									.valueOf(res.getString(3))) / 2);
				}
			}
		} else {
			if (searchString.length() != 0) {
				Dialog dialog = new Dialog(new JFrame(),
						TextValues.ADDRESS_NOT_FOUND_TITLE, appV);
				dialog.show(TextValues.ADDRESS_NOT_FOUND_TEXT,
						TextValues.OK_BUTTON, null, Values.DIALOG_WITHOUT_ANY);
			} else if (searchString.length() == 0 && map != null) {
				Dialog dialog = new Dialog(new JFrame(),
						TextValues.NO_TEXT_TITLE, appV);
				dialog.show(TextValues.NO_TEXT_TEXT, TextValues.OK_BUTTON,
						null, Values.DIALOG_WITHOUT_ANY);
			}
		}
	}
}
