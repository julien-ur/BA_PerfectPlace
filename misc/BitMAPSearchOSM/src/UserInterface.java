import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.util.ArrayList;
import java.util.Hashtable;

import javax.swing.BorderFactory;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JLayeredPane;
import javax.swing.JPanel;
import javax.swing.JSeparator;
import javax.swing.JSlider;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.border.Border;
import javax.swing.border.EmptyBorder;
import javax.swing.border.EtchedBorder;

/**
 * This class contains methods to create and modify the elements for the user
 * interaction.
 * 
 * @author Judith Höreth
 * 
 */
public class UserInterface {
	private JComboBox<String> amenityList;
	private JSlider sliderImportance, sliderDilate;
	private JPanel menu, queryPanel, startPanel, buttonLine, mapPanel, allMaps;
	private JButton createMapExtractButton, buttonQueryStart,
			newParameterButton, helpButton, backButton, searchStartButton;
	private ArrayList<JSlider> allSliders;
	private ArrayList<JComboBox<String>> allComboboxes;
	private ArrayList<JPanel> allParameterPanels;
	private ArrayList<JButton> deleteButtons;
	private ArrayList<JCheckBox[]> allCheckBoxes;
	private JLayeredPane layeredPane;
	private Style style;
	private JLabel distanceLabel;
	private ArrayList<JLabel> allDistanceLabels;
	private JCheckBox showIcons, showHouses;
	private JTextField searchBox;
	int count = 0;

	public UserInterface() {
		allSliders = new ArrayList<JSlider>();
		allComboboxes = new ArrayList<JComboBox<String>>();
		allParameterPanels = new ArrayList<JPanel>();
		deleteButtons = new ArrayList<JButton>();
		allCheckBoxes = new ArrayList<JCheckBox[]>();
		allDistanceLabels = new ArrayList<JLabel>();
		style = new Style();
	}

	/**
	 * method to create the interface. Among the creation of the button, which
	 * starts the query, a method to create the menu, which contains the
	 * different panels is called.
	 * 
	 * @param selectedItems
	 *            String array to save all the selected items of the comboBox
	 *            (four different comboboxes). If there are only some of the
	 *            selected, the values of the other positions are null.
	 * @param queryValues
	 *            Array that contains importance, blur and dilate values for
	 *            each of the four panels, whose items can be combined for the
	 *            entire query.
	 * @return JPanel to be added to the root Pane in the MyApplet-class.
	 */
	JPanel createUI(String[] selectedItems, int[][] queryValues) {
		JPanel topPanelMenu = new JPanel();
		topPanelMenu
				.setLayout(new BoxLayout(topPanelMenu, BoxLayout.LINE_AXIS));
		topPanelMenu.add(createStartPanel());
		topPanelMenu.add(createMenuPanel(selectedItems, queryValues));
		style.setColors(topPanelMenu);
		return topPanelMenu;
	}

	/**
	 * The menu-panel which is visible at the beginning of the application is
	 * created. It only contains a button.
	 * 
	 * @return startpanel
	 */
	private JPanel createStartPanel() {
		startPanel = new JPanel();
		startPanel.setLayout(new BoxLayout(startPanel, BoxLayout.Y_AXIS));
		startPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
		JPanel searchPanel = new JPanel(new FlowLayout());
		searchPanel.setMaximumSize(new Dimension(500, 70));
		style.setColors(searchPanel);
		searchBox = new JTextField();
		searchBox.setColumns(18);
		searchStartButton = new JButton(TextValues.SEARCH_START);
		style.setFont(searchStartButton, 20);
		style.setFont(searchBox, 20);
		searchPanel.add(searchBox);
		searchPanel.add(searchStartButton);
		createMapExtractButton = new JButton(TextValues.START_BUTTON);
		style.setFont(createMapExtractButton, 18);
		JLabel welcomeText = new JLabel("<html>" + TextValues.WELCOME_TEXT
				+ "</html>");
		style.setFont(welcomeText, 20);
		style.setColors(welcomeText);
		welcomeText.setBorder(new EmptyBorder(60, 30, 30, 0));
		welcomeText.setAlignmentX(Component.CENTER_ALIGNMENT);
		createMapExtractButton.setAlignmentX(Component.CENTER_ALIGNMENT);
		searchPanel.setAlignmentX(Component.CENTER_ALIGNMENT);
		startPanel.add(searchPanel);
		startPanel.add(welcomeText);
		startPanel.add(createMapExtractButton);
		style.setColors(startPanel);
		return startPanel;
	}

	/**
	 * The UI for choosing the different amenity-types is created. At the
	 * beginning of the program, it is invisible. It gets visible, when a map
	 * for calculation is chosen by the user.
	 * 
	 * @param selectedItems
	 *            String array to save all the selected items of the comboBox
	 *            (four different comboboxes). If there are only some of the
	 *            selected, the values of the other positions are null.
	 * @param queryValues
	 *            Array that contains importance, blur and dilate values for
	 *            each of the four panels, whose items can be combined for the
	 *            entire query.
	 * @return panel for choosing different amenities, which is visible after
	 *         defining a map-sequence.
	 */
	private JPanel createMenuPanel(String[] selectedItems, int[][] queryValues) {
		queryPanel = new JPanel();
		queryPanel.setLayout(new BorderLayout());
		buttonLine = createButtons();
		menu = createMenu(selectedItems, queryValues);
		queryPanel.add(buttonLine, BorderLayout.NORTH);
		queryPanel.add(menu, BorderLayout.CENTER);
		style.setColors(queryPanel);
		return queryPanel;
	}

	/**
	 * Creation of a panel which contains the map-object.
	 * 
	 * @param map
	 *            which is created
	 * @return panel with map in it
	 */
	JPanel createMapPanel(Map map) {
		JPanel mapPanel = new JPanel();
		mapPanel.add(map.getMapKit());
		mapPanel.setBorder(new EmptyBorder(
				(Values.WINDOW_HEIGHT - Values.HEIGHT) / 5, 0, 0, 0));
		style.setColors(mapPanel);
		return mapPanel;
	}

	/**
	 * Creation of map
	 * 
	 * @param map
	 *            which is created
	 */
	void createMap(Map map) {
		mapPanel = createMapPanel(map);
		createLayeredPane();
		allMaps = new JPanel();
		allMaps.setLayout(new BoxLayout(allMaps, BoxLayout.LINE_AXIS));
		allMaps.add(mapPanel);
		allMaps.add(layeredPane);
		layeredPane.setVisible(false);
	}

	void createLayeredPane() {
		layeredPane = new JLayeredPane();
		layeredPane.setLayout(null);
		layeredPane
				.setPreferredSize(new Dimension(Values.WIDTH, Values.HEIGHT));
		style.setColors(layeredPane);
		layeredPane.setOpaque(true);
	}

	/**
	 * Creation of buttons which are displayed the whole time of the menu-panel.
	 * It contains the newParamter-button, the back-button and the help-button.
	 * If at least on paramter is created, the menu panel contains two
	 * checkboxes, which can be selected or deselected to change the visiblility
	 * of shown houses and icons as well.
	 * 
	 * @return panel with containing topMenu elements
	 */
	private JPanel createButtons() {
		buttonLine = new JPanel();
		newParameterButton = new JButton(TextValues.NEW_PARAM);
		helpButton = new JButton(TextValues.QUESTION);
		backButton = new JButton(TextValues.BACK_TO_MAP);
		JPanel checkBoxesTop = createCheckBoxesTop();
		JPanel menuTop = new JPanel(new BorderLayout());
		buttonLine.add(newParameterButton);
		buttonLine.add(backButton);
		buttonLine.add(helpButton);
		buttonLine.setBorder(new EmptyBorder(10, 10, 0, 50));
		style.setFont(backButton, 20);
		style.setFont(helpButton, 20);
		style.setFont(newParameterButton, 20);
		style.setColors(buttonLine);
		menuTop.add(buttonLine, BorderLayout.NORTH);
		menuTop.add(checkBoxesTop, BorderLayout.SOUTH);
		return menuTop;
	}

	/**
	 * Creation of the checkboxes which are shown in the menu-panel if at least
	 * one parameter is created.
	 * 
	 * @return panel with containing checkboxes
	 */
	private JPanel createCheckBoxesTop() {
		JPanel cBTop = new JPanel();
		showHouses = new JCheckBox("Häuser anzeigen");
		showIcons = new JCheckBox("Icons anzeigen");
		showIcons.setSelected(true);
		showHouses.setSelected(true);
		showHouses.setName("showHouses");
		showIcons.setName("showIcons");
		cBTop.add(showHouses);
		cBTop.add(showIcons);
		style.setColors(showHouses);
		style.setColors(showIcons);
		style.setFont(showHouses, 20);
		style.setFont(showIcons, 20);
		style.setColors(cBTop);
		showHouses.setVisible(false);
		showIcons.setVisible(false);
		return cBTop;
	}

	/**
	 * Four panels are created (call of the createPanel-method) and added to the
	 * menu.
	 * 
	 * @param selectedItems
	 *            String array to save all the selected items of the comboBox
	 *            (four different comboboxes). If there are only some of the
	 *            selected, the values of the other positions are null.
	 * @param queryValues
	 *            Array that contains importance, blur and dilate values for
	 *            each of the four panels, whose items can be combined for the
	 *            entire query.
	 * @return JPanel, which contains the combobox to choose the amenity and the
	 *         belonging sliders to determine the values of each item.
	 */
	JPanel createMenu(String[] selectedItems, int[][] queryValues) {
		JPanel menu = new JPanel();
		menu.setBorder(new EmptyBorder(0, 10, 0, 50));
		menu.setLayout(new GridLayout(2, 2));
		for (int i = 0; i < 4; i++) {
			JPanel panel = createPanel(String.valueOf(i), selectedItems,
					queryValues);
			menu.add(panel);
		}
		style.setColors(menu);
		return menu;
	}

	/**
	 * The method creates a Panel and add a combobox and sliders to it. This
	 * method is called four times in the createMenu-method to design each of
	 * the panels.
	 * 
	 * @param name
	 *            differentiation between the different panels (String of
	 *            numbers between zero and three).
	 * @param selectedItems
	 *            String array to save all the selected items of the comboBox
	 *            (four different comboboxes). If there are only some of the
	 *            selected, the values of the other positions are null.
	 * @param queryValues
	 *            Array that contains importance, blur and dilate values for
	 *            each of the four panels, whose items can be combined for the
	 *            entire query.
	 * @return Panel to be added to the menu.
	 */
	JPanel createPanel(String name, String[] selectedItems, int[][] queryValues) {
		JPanel panel = new JPanel(new GridLayout(2, 1));
		panel.setName(name);
		Border raisedetched = BorderFactory
				.createEtchedBorder(EtchedBorder.RAISED);
		panel.setBorder(raisedetched);
		JPanel query = createQueryPanel(selectedItems);
		JPanel options = createOptionsPanel();
		panel.add(query);
		panel.add(options);
		allParameterPanels.add(panel);
		style.setColors(panel);
		return panel;
	}

	/**
	 * This methods creates the part of the parameter panel which handles the
	 * options of the appropriate parameter.It contains the two sliders to
	 * change the distance and importance values.
	 * 
	 * @return panel with containing sliders
	 */
	private JPanel createOptionsPanel() {
		JPanel optionsPanel = new JPanel(new GridLayout(2, 1));
		JPanel distancePanel = new JPanel();
		distancePanel.setLayout(new BoxLayout(distancePanel,
				BoxLayout.PAGE_AXIS));
		distanceLabel = createJLabel(TextValues.DISTANCE_SLIDER_TEXT_POS);
		allDistanceLabels.add(distanceLabel);
		distancePanel.add(distanceLabel);
		sliderDilate = createSlider(distancePanel, "distance", 9, 1);
		distancePanel.add(sliderDilate);
		optionsPanel.add(distancePanel);
		JPanel importancePanel = new JPanel();
		importancePanel.setLayout(new BoxLayout(importancePanel,
				BoxLayout.PAGE_AXIS));
		importancePanel.add(createJLabel(TextValues.IMPORTACNE_SLIDER_TEXT));
		sliderImportance = createSlider(importancePanel, "importance", 2, 0);
		sliderImportance.setValue(Values.VERY_IMPORTANT);
		importancePanel.add(sliderImportance);
		optionsPanel.add(importancePanel);
		style.setColors(distancePanel);
		style.setColors(optionsPanel);
		style.setColors(importancePanel);
		return optionsPanel;

	}

	/**
	 * This method creates the part of the parameter-panel which handles
	 * information and configurations about the query. It contains a combobox to
	 * choose a category of a parameter as well as the checkboxes which appear
	 * with the appropriate contents if a category is selected.
	 * 
	 * @param selectedItems
	 * @return panel with containing elements to configurate the query
	 */
	private JPanel createQueryPanel(String[] selectedItems) {
		JPanel queryPanel = new JPanel();
		queryPanel.setLayout(new BoxLayout(queryPanel, BoxLayout.PAGE_AXIS));
		JPanel topPanel = new JPanel();
		JComboBox<String> myComboBox = createComboBox(selectedItems);
		JButton deleteButton = new JButton(TextValues.DELETE);
		deleteButton.setName("delete");
		deleteButtons.add(deleteButton);
		style.setColors(myComboBox);
		topPanel.add(myComboBox);
		topPanel.add(deleteButton);
		style.setColors(topPanel);
		queryPanel.add(topPanel);
		JPanel cbPanel = new JPanel();
		cbPanel.setLayout(new GridLayout(3, 3));
		JCheckBox[] cbArray = new JCheckBox[6];
		for (int i = 0; i < 6; i++) {
			JCheckBox cB = new JCheckBox();
			style.setColors(cB);
			cB.setVisible(false);
			cbArray[i] = cB;
			cbPanel.add(cB);
		}
		allCheckBoxes.add(cbArray);
		queryPanel.add(cbPanel);
		JSeparator sep = new JSeparator(SwingConstants.HORIZONTAL);
		queryPanel.add(sep);
		style.setColors(cbPanel);
		style.setColors(queryPanel);
		style.setColors(sep);
		return queryPanel;
	}

	/**
	 * Creation of a JLabel with given text.
	 * 
	 * @param dilateText
	 *            Text of the label
	 * @return Label which is added to the actual panel.
	 */
	private JLabel createJLabel(String dilateText) {
		JLabel label = new JLabel(dilateText);
		style.setColors(label);
		return label;
	}

	/**
	 * The Combobox is initialized and filled with the amenity-string.
	 * Additionally the ActionListener is created and added to the combobox.
	 * 
	 * @param selectedItems
	 *            String array to save all the selected items of the comboBox
	 *            (four different comboboxes). If there are only some of the
	 *            selected, the values of the other positions are null.
	 * @return Combobox, which is added to the actual panel.
	 */
	private JComboBox<String> createComboBox(String[] selectedItems) {
		amenityList = new JComboBox<String>(QueryValues.AMENITIES);
		amenityList.setSelectedIndex(0);
		style.setColors(amenityList);
		allComboboxes.add(amenityList);
		return amenityList;
	}

	/**
	 * Slider with the given values is created. Values are defined and entered
	 * on the slider.
	 * 
	 * @param panel
	 *            for which the slider is created.
	 * @param s
	 *            determines the type of the slider (distance, importance or
	 *            blur).
	 * @param max
	 *            highest value of the slider.
	 * @param min
	 *            lowest value of the slider.
	 * @return slider which is added to the actual panel.
	 */
	JSlider createSlider(JPanel panel, String s, int max, int min) {
		JSlider slider = new JSlider(JSlider.HORIZONTAL, min, max, min);
		Hashtable<Integer, JLabel> labelTable = new Hashtable<Integer, JLabel>();
		switch (s) {
		case "distance":
			labelTable.put(new Integer(min), new JLabel("ca. 100m"));
			labelTable.put(new Integer(5), new JLabel("ca. 1km"));
			labelTable.put(new Integer(max), new JLabel("ca. 2km"));
			break;
		case "importance":
			labelTable.put(new Integer(min), new JLabel("unwichtig"));
			labelTable.put(new Integer(1), new JLabel("wichtig"));
			labelTable.put(new Integer(max), new JLabel("sehr wichtig"));
			break;
		}
		slider.setLabelTable(labelTable);
		slider.setMajorTickSpacing(max);
		slider.setMinorTickSpacing(1);
		slider.setPaintTicks(true);
		slider.setPaintLabels(true);
		style.setColors(slider);
		allSliders.add(slider);
		count++;
		return slider;
	}

	/**
	 * According to the selected category, the appropriate amenities have to be
	 * displayed (and checkboxes, which are not used, have to set hidden)
	 * 
	 * @param pos
	 *            position of chosen category
	 * @param amenities
	 *            appropriate amenities to the chosen category
	 */
	public void refreshCheckBoxes(int pos, String[] amenities) {
		JCheckBox[] cbArray = getCheckBoxes().get(pos);
		for (int j = 0; j < cbArray.length; j++) {
			cbArray[j].setText("");
			cbArray[j].setSelected(false);
			cbArray[j].setVisible(false);
		}
		if (amenities != null) {
			for (int i = 0; i < amenities.length; i++) {
				cbArray[i].setText(amenities[i]);
				cbArray[i].setVisible(true);
			}
		}
	}

	void refreshPanel(int pos) {
		getAllComboboxes().get(pos).setSelectedItem(QueryValues.AMENITIES[0]);
	}

	JButton getButtonQueryStart() {
		return buttonQueryStart;
	}

	JButton getCreateMapExtractButton() {
		return createMapExtractButton;
	}

	JButton getNewParameterButton() {
		return newParameterButton;
	}

	JButton getHelpButton() {
		return helpButton;
	}

	JButton getBackButton() {
		return backButton;
	}

	JPanel getStartPanel() {
		return startPanel;
	}

	JPanel getQueryPanel() {
		return queryPanel;
	}

	ArrayList<JSlider> getAllSliders() {
		return allSliders;
	}

	ArrayList<JComboBox<String>> getAllComboboxes() {
		return allComboboxes;
	}

	ArrayList<JPanel> getAllParameterPanels() {
		return allParameterPanels;
	}

	ArrayList<JButton> getDeleteButtons() {
		return deleteButtons;
	}

	ArrayList<JCheckBox[]> getCheckBoxes() {
		return allCheckBoxes;
	}

	JPanel getAllMapPanel() {
		return allMaps;
	}

	JPanel getMapPanel() {
		return mapPanel;
	}

	JLayeredPane getLayeredPane() {
		return layeredPane;
	}

	ArrayList<JLabel> getDistanceLabels() {
		return allDistanceLabels;
	}

	JCheckBox getShowHouses() {
		return showHouses;
	}

	JCheckBox getShowIcons() {
		return showIcons;
	}

	JButton getSearchStartButton() {
		return searchStartButton;
	}

	JTextField getSearchBox() {
		return searchBox;
	}

	/**
	 * if no parameter is visible or if the zoom of the map is too small to show
	 * houses, the checkbox to set the shown houses visible/hidden is
	 * hidden.Additionally, if there is no parameter, the option to decide
	 * whether the icons shall be displayed or not is set hidden.
	 * (These checkboxes wouldn't have any effect in this status)
	 * 
	 * @param parameterCount
	 * @param zoom
	 */
	void setCheckBoxes(int parameterCount, int zoom) {
		if (zoom > 14 && parameterCount > 0) {
			showHouses.setVisible(true);
		} else {
			showHouses.setVisible(false);
		}
		if (parameterCount > 0) {
			showIcons.setVisible(true);

		} else {
			showIcons.setVisible(false);
		}
	}

}
