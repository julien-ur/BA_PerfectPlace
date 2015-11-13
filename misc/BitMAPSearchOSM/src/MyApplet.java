import java.awt.AlphaComposite;
import java.awt.BasicStroke;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Container;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Insets;
import java.awt.Toolkit;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.geom.Ellipse2D;
import java.awt.geom.GeneralPath;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import javax.imageio.ImageIO;
import javax.swing.ImageIcon;
import javax.swing.JApplet;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JSlider;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;

/**
 * Main-class of the program which starts the applet and contains some methods
 * to update elements.
 * 
 * @author Judith Höreth
 * 
 * 
 */
public class MyApplet extends JApplet implements ActionListener,
		ChangeListener, ItemListener, MouseListener {
	private static final long serialVersionUID = 1L;
	private ArrayList<Integer> waysWithTag;
	private ArrayList<String> allNodesOfWay;
	private ArrayList<Float[]> nodeLatLonWithTag;
	static Float[] latLon;
	private static ArrayList<Float[]> allLatLon;
	private BufferedImage img, layer1, layer2, layer3, layer4, layerAll,
			layerIcon1, layerIcon2, layerIcon3, layerIcon4;
	private BufferedImage[] layers, layerIcons;
	private MapInformation mI;
	private MapToPixel mtp;
	private UserInterface ui;
	private HouseCalculation hC;
	private ValueAttribution vA;
	private int queryCount = 0;
	private Map map;
	private Icons icons;
	private JPanel wholeUI;
	private LoadingScreen screen;
	private final Object lock = new Object();
	private JLabel staticMap;
	private OverlayLabel layerAllLabel, icon1Label, icon2Label, icon3Label,
			icon4Label;
	private OverlayLabel[] iconsLabels;
	private AppletValues appV;
	private PerformAction pA;
	private PerformChange pC;
	private boolean showHouses = true, showIcons = true;

	/**
	 * Initialization of the applet.
	 */
	public void init() {
		try {
			javax.swing.SwingUtilities.invokeAndWait(new Runnable() {
				public void run() {
					Insets scnMax = Toolkit.getDefaultToolkit()
							.getScreenInsets(getGraphicsConfiguration());
					int taskBarSize = scnMax.bottom;
					setSize(Values.WINDOW_WIDTH, Values.WINDOW_HEIGHT
							- taskBarSize * 2);
					createClassObjects();
					setArrays();
					appV.setCode("beforeSelection");
					createUI();
				}
			});
		} catch (Exception e) {
			System.err.println("UI creation did not successfully complete");
		}
	}

	/**
	 * Creation of objects of the different classes to be able to call the
	 * belonging methods later.
	 */
	private void createClassObjects() {
		appV = new AppletValues();
		vA = new ValueAttribution(appV);
		map = new Map(appV);
		ui = new UserInterface();
		icons = new Icons();
		pA = new PerformAction(ui, appV, this);
		pC = new PerformChange(ui, appV, vA);
	}

	/**
	 * Creation of arrays which contain the layers,which are used to draw the
	 * amenities and icons on. For later use, it is easier to save them in
	 * arrays.
	 */
	private void setArrays() {
		layers = new BufferedImage[] { layer1, layer2, layer3, layer4 };
		layerIcons = new BufferedImage[] { layerIcon1, layerIcon2, layerIcon3,
				layerIcon4 };
		iconsLabels = new OverlayLabel[] { icon1Label, icon2Label, icon3Label,
				icon4Label };
	}

	/**
	 * BufferedImages, which represent the different overlays are created(or
	 * refreshed) with same width and height as the map-image. They have the
	 * type "3BYTE_BGR", so that they can be converted to mat-objects later
	 * (important to apply the filter). This method is also called when a
	 * parameter(such as distance) changed. Only this overlay is recreated,
	 * which is influenced by the change. At the end, the layer which merges all
	 * overlays must be recreated to obtain the refreshed layer.
	 * 
	 * @param layertoRefresh
	 *            gives the number of the layer, which should be refreshed.
	 */
	private void createOverlays(int layerToRefresh) {
		layers[layerToRefresh] = new BufferedImage(Values.WIDTH, Values.HEIGHT,
				BufferedImage.TYPE_3BYTE_BGR);
		layerAll = new BufferedImage(Values.WIDTH, Values.HEIGHT,
				BufferedImage.TYPE_INT_ARGB);
		layerIcons[layerToRefresh] = new BufferedImage(Values.WIDTH,
				Values.HEIGHT, BufferedImage.TYPE_INT_ARGB);
	}

	/**
	 * This method is called whenever a amenity is created in the map. It
	 * creates the appropriate icon and calculates the position of it. If "img"
	 * is null, no icon matches the query, which means that the "Own location"
	 * function is used. In this case, a text, which is created by the user, is
	 * displayed instead of an icon.
	 * 
	 * @param img
	 *            paths of matching icon
	 * @param x
	 *            X value of the icon
	 * @param y
	 *            Y value of the icon
	 */
	private void createIcons(BufferedImage img, float x, float y) {
		Graphics2D g2d = (Graphics2D) layerIcons[appV.getLayerToRefresh()]
				.createGraphics();
		if (img != null) {
			int iconSize = mtp.getIconSize();
			g2d.drawImage(img, (int) x - iconSize / 2, (int) y - iconSize / 2,
					iconSize, iconSize, null);
		} else {
			String name = appV.getCustomParameterName();
			if (name != null) {
				g2d.setFont(new Font("Gulim", Font.PLAIN, 18));
				g2d.setColor(Color.WHITE);
				g2d.drawString(name, x - name.length() * 3, y);
			}
		}
	}

	/**
	 * Data acquisition of given query. Saved data are drawn on the overlay. The
	 * method checks whether the parameter is positive or negative in order to
	 * manage the appropriate drawing. After that, the filter method is called
	 * to apply the blur filter. At the end the importance of the given query is
	 * saved and added to an array, which saves all chosen importance-values, to
	 * adapt the limitValues, which define the best-region.
	 * 
	 * @param query
	 *            search amenities of this type in the osm-file.
	 * @param layer
	 *            determination of layer for drawing process
	 * @param importance
	 *            value(0,1 or 2)
	 * @param radius
	 *            dilate-value
	 * @param customQuery
	 *            value which contains the position of the own location (if the
	 *            parameter has another category, the value at the position of
	 *            the parameter is null)
	 * @param layerToRefresh
	 *            layer on which the parameter information shall be drawn
	 * @param blurValue
	 *            blur-value(size of matrix for the gaussian-filter)
	 */
	void getDataOfGivenSearchQuery(ArrayList<String> query,
			BufferedImage layer, int importance, int radius, int blurValue,
			int[][] customQuery, int layerToRefresh) {
		boolean oneSelected = checkIfOneSelected(customQuery, layerToRefresh);
		if (appV.getQueryType()[layerToRefresh] == Values.NEGATIVE
				&& oneSelected == true) {
			Graphics g2d = layers[layerToRefresh].createGraphics();
			g2d.setColor(vA
					.getColor(importance, layer, layers, Values.POSITIVE));
			g2d.fillRect(0, 0, Values.WIDTH, Values.HEIGHT);
		}
		if (oneSelected == true) {
			getData(query, layer, importance, radius,
					appV.getQueryType()[layerToRefresh], customQuery,
					layerToRefresh);
			filterLayers(layer, blurValue);
		}
	}

	/**
	 * This method checks if at least one of the checkboxes which describe the
	 * amenities of a category is selected.
	 * 
	 * @param customQuery
	 *            value which contains the position of the own location (if the
	 *            parameter has another category, the value at the position of
	 *            the parameter is null)
	 * @param layerToRefresh
	 *            concerned layer
	 * @return true of at least one checkbox of the chosen category is selected
	 */
	private boolean checkIfOneSelected(int[][] customQuery, int layerToRefresh) {
		boolean oneSelected = false;
		if (customQuery[layerToRefresh] != null) {
			oneSelected = true;
		}
		for (int i = 0; i < ui.getCheckBoxes().get(layerToRefresh).length; i++) {
			if (ui.getCheckBoxes().get(layerToRefresh)[i].isSelected() == true) {
				oneSelected = true;
			}
		}
		return oneSelected;
	}

	/**
	 * Methods of the MapInformation-class fetch the data for the given
	 * searchQuery and save them into ArrayLists. Nodes of each way are stored
	 * in the allLatLon-variable. Call of the drawPolygon()-method for every
	 * single way (one way = one object of the queried amenity-type). If the
	 * object contains only one node, the drawPolygon()-method is also called,
	 * but with another parameter to differentiate the sort of drawing in that
	 * method.
	 * 
	 * @param searchQuery
	 *            search amenities of this type in the osm-file.
	 * @param layer
	 *            determination of layer for drawing process
	 * @param importance
	 *            value(0,1 or 2)
	 * @param radius
	 *            distance configuration
	 * @param queryType
	 *            type of parameter(positive or negative)
	 * @param customQuery
	 *            value which contains the position of the own location (if the
	 *            parameter has another category, the value at the position of
	 *            the parameter is null)
	 * @param layerToRoRefresh
	 *            concerned layer
	 * 
	 */
	private void getData(ArrayList<String> searchQuery, BufferedImage layer,
			int importance, int radius, int queryType, int[][] customQuery,
			int layerToRefresh) {
		if (customQuery[layerToRefresh] == null) {
			for (int i = 0; i < searchQuery.size(); i++) {
				waysWithTag = mI.getAllWaysWithGivenTag(searchQuery.get(i));
				for (int j = 0; j < waysWithTag.size(); j++) {
					allNodesOfWay = mI
							.getAllNodesOfGivenWay(waysWithTag.get(j));
					allLatLon = new ArrayList<Float[]>();
					for (int k = 0; k < allNodesOfWay.size(); k++) {
						latLon = mI.getLatLonOfGivenNode(allNodesOfWay.get(k));
						allLatLon.add(latLon);
					}
					drawPolygon("allLatLon", layer, importance, radius,
							searchQuery.get(i), queryType, customQuery,
							layerToRefresh);
				}
				nodeLatLonWithTag = mI.getLatLonOfNodeWithTags(searchQuery
						.get(i));
				drawPolygon("nodeLatLonWithTag", layer, importance, radius,
						searchQuery.get(i), queryType, customQuery,
						layerToRefresh);
			}
		} else {
			drawPolygon("nodeLatLonWithTag", layer, importance, radius, null,
					queryType, customQuery, layerToRefresh);
		}
	}

	/**
	 * The parameters tell the program, how to draw the polygons around the
	 * amenities on the map. To be able to draw the polygons on the layer, the
	 * given data are converted into pixel (If there is a single-node-amenity, a
	 * circle is drawn around this node instead of drawing a polygon with the
	 * given points of a way. Before drawing the method checks, whether the
	 * amenties are declared correct in the file - if they have the same start-
	 * and end-position. If not it creates a correct polygon by returning
	 * manually to the start point of the declared amenity.
	 * 
	 * @param latLonsOfWay
	 *            parameter which indicates, whether the object has only one
	 *            node or a whole way with several nodes.
	 * @param layer
	 *            determination of layer for drawing process
	 * @param importance
	 *            value(0,1 or 2)
	 * @param radius
	 *            distance configuration
	 * @param searchQuery
	 *            query which contains the parameter to draw
	 * @param queryType
	 *            type of parameter(positive or negative)
	 * @param customQuery
	 *            value which contains the position of the own location (if the
	 *            parameter has another category, the value at the position of
	 *            the parameter is null)
	 * @param layerToRefresh
	 *            concerned layer
	 */
	private void drawPolygon(String latLonsOfWay, BufferedImage layer,
			int importance, int radius, String searchQuery, int queryType,
			int[][] customQuery, int layerToRefresh) {
		Graphics2D g2d = (Graphics2D) layer.createGraphics();
		g2d.setColor(vA.getColor(importance, layer, layers, queryType));
		BasicStroke stroke = new BasicStroke(mtp.getDilateValue(radius));
		g2d.setStroke(stroke);
		switch (latLonsOfWay) {
		case "allLatLon":
			GeneralPath polyline = new GeneralPath(GeneralPath.WIND_EVEN_ODD,
					allLatLon.size());
			float yStart = mtp.getYInMapBitmap(allLatLon.get(0)[0]);
			float xStart = mtp.getXInMapBitmap(allLatLon.get(0)[1]);
			int j = 0;
			int k = 0;
			int start = 0;
			int stop = 0;
			while (yStart < 0) {
				yStart = mtp.getYInMapBitmap(allLatLon.get(j)[0]);
				j++;
			}
			while (xStart < 0) {
				xStart = mtp.getXInMapBitmap(allLatLon.get(k)[1]);
				k++;
			}
			while (yStart > Values.HEIGHT) {
				yStart = mtp.getYInMapBitmap(allLatLon.get(j)[0]);
				j++;
			}
			while (xStart > Values.WIDTH) {
				xStart = mtp.getXInMapBitmap(allLatLon.get(k)[1]);
				k++;
			}
			if (j > k && j > 0) {
				start = j - 1;
			} else if (k > j && k > 0) {
				start = k - 1;
			}
			yStart = mtp.getYInMapBitmap(allLatLon.get(start)[0]);
			xStart = mtp.getXInMapBitmap(allLatLon.get(start)[1]);
			polyline.moveTo(xStart, yStart);
			for (int i = start + 1; i < allLatLon.size() - 1; i++) {
				if (allLatLon.get(i) != null) {
					float y = mtp.getYInMapBitmap(allLatLon.get(i)[0]);
					float x = mtp.getXInMapBitmap(allLatLon.get(i)[1]);
					if (x < 0) {
						x = 0;
						stop = i;
						polyline.lineTo(x, y);
						break;
					} else if (x > Values.WIDTH) {
						x = Values.WIDTH;
						stop = i;
						polyline.lineTo(x, y);
						break;
					}
					if (y < 0) {
						y = 0;
						stop = i;
						polyline.lineTo(x, y);
						break;
					} else if (y > Values.HEIGHT) {
						y = Values.HEIGHT;
						stop = i;
						polyline.lineTo(x, y);
						break;
					}
					polyline.lineTo(x, y);
				}
			}
			float xEnd = 0;
			float yEnd = 0;
			if (stop > 0) {
				yEnd = mtp.getYInMapBitmap(allLatLon.get(stop)[0]);
				xEnd = mtp.getXInMapBitmap(allLatLon.get(stop)[1]);
			} else {
				yEnd = mtp
						.getYInMapBitmap(allLatLon.get(allLatLon.size() - 1)[0]);
				xEnd = mtp
						.getXInMapBitmap(allLatLon.get(allLatLon.size() - 1)[1]);
			}
			if (xEnd != xStart && yEnd != yStart) {
				for (int i = allLatLon.size() - 1; i > 0; i--) {
					float y = mtp.getYInMapBitmap(allLatLon.get(i)[0]);
					float x = mtp.getXInMapBitmap(allLatLon.get(i)[1]);
					polyline.lineTo(x, y);
				}
			}
			g2d.draw(polyline);
			g2d.fill(polyline);
			float[] iconPosition = icons.checkPosition(polyline,
					(float) polyline.getBounds().getCenterX(), (float) polyline
							.getBounds().getCenterY());
			createIcons(icons.getIcon(searchQuery), iconPosition[0],
					iconPosition[1]);
			break;
		case "nodeLatLonWithTag":
			if (customQuery[layerToRefresh] == null
					|| customQuery[layerToRefresh][0] == 0
					|| customQuery[layerToRefresh][1] == 0) {
				if (nodeLatLonWithTag != null) {
					for (int i = 0; i < nodeLatLonWithTag.size(); i++) {
						float y = mtp
								.getYInMapBitmap(nodeLatLonWithTag.get(i)[0]);
						float x = mtp
								.getXInMapBitmap(nodeLatLonWithTag.get(i)[1]);
						Ellipse2D.Double circle = new Ellipse2D.Double(x
								- mtp.getDilateValue(radius) / 2, y
								- mtp.getDilateValue(radius) / 2,
								mtp.getDilateValue(radius),
								mtp.getDilateValue(radius));
						g2d.fill(circle);
						createIcons(icons.getIcon(searchQuery), x, y);
					}
				}
			} else {
				Ellipse2D.Double circle = new Ellipse2D.Double(
						customQuery[layerToRefresh][0]
								- mtp.getDilateValue(radius) / 2,
						customQuery[layerToRefresh][1]
								- mtp.getDilateValue(radius) / 2,
						mtp.getDilateValue(radius), mtp.getDilateValue(radius));
				g2d.fill(circle);
				createIcons(null, customQuery[layerToRefresh][0],
						customQuery[layerToRefresh][1]);
			}
			break;
		}
	}

	/**
	 * Creation of a filter-object. Call of the blur-filter(to prefer regions,
	 * which are nearer to the amenity, than those, which are further away).
	 * 
	 * @param layer
	 *            determination of layer for drawing process
	 * @param blurValue
	 *            blur-value(size of matrix for the gaussian-filter)
	 */
	private void filterLayers(BufferedImage layer, int blurValue) {
		Filter filter = new Filter(appV);
		filter.filterNow(layer, blurValue);
	}

	/**
	 * To be able to calculate the brightest area (the best region), all
	 * different layers are summed up and saved in one BufferedImage(layerAll).
	 */
	private void sumUpALlLayers() {
		AlphaComposite ac1 = AlphaComposite.getInstance(
				AlphaComposite.SRC_OVER, Values.TRANSPARENCY_LAYER);
		Graphics2D g2d = (Graphics2D) layerAll.createGraphics();
		g2d.setComposite(ac1);
		for (int i = 0; i < layers.length; i++) {
			g2d.drawImage(layers[i], 0, 0, Values.WIDTH, Values.HEIGHT, null);
		}
	}

	/**
	 * The houses, which are in the best region are drawn and painted green. To
	 * accelerate this process, two threads are used. Each of the thread draws
	 * one half of the houses.
	 * 
	 * @param allHouses
	 *            list of way-nodes of all calculated houses
	 */
	void drawHouse(ArrayList<ArrayList<Float[]>> allHouses) {
		Graphics2D g2d = (Graphics2D) layerAll.createGraphics();
		for (int i = 0; i < allHouses.size() - 1; i = i + 2) {
			new HouseThread(allHouses, i, g2d).start();
			new HouseThread(allHouses, i + 1, g2d).start();
		}
	}

	/**
	 * Creation of the UI. Methods in the UserInterfae-class are called to build
	 * different elements of the UI. The elements are all added to the Root
	 * Pane. It is specified, whether the UI should display map and
	 * start-button, or whether it should show the second menu, which contains
	 * the elements to perform the query with different amenities. Additionally
	 * the Listener are defined for all elements.
	 */
	private void createUI() {
		if (appV.getCode().equals("beforeSelection")) {
			JPanel topPanelMenu = ui.createUI(appV.getSelectedItems(),
					appV.getQueryValues());
			addListeners();
			ui.createMap(map);
			wholeUI = new JPanel();
			wholeUI.setLayout(new BorderLayout());
			wholeUI.add(topPanelMenu, BorderLayout.CENTER);
			wholeUI.add(ui.getAllMapPanel(), BorderLayout.WEST);
			this.add(wholeUI);
			setLoadingScreen();
			ui.getQueryPanel().setVisible(false);
		} else {
			ui.getMapPanel().setVisible(false);
			ui.getLayeredPane().setVisible(true);
			ui.getStartPanel().setVisible(false);
			for (int i = 0; i < ui.getAllParameterPanels().size(); i++) {
				ui.getAllParameterPanels().get(i).setVisible(false);
			}
		}
		setVisible(true);
	}

	/**
	 * all listeners are created and added to the appropriate ui-element.
	 */
	private void addListeners() {
		ui.getCreateMapExtractButton().addActionListener(this);
		ui.getNewParameterButton().addActionListener(this);
		ui.getBackButton().addActionListener(this);
		ui.getHelpButton().addActionListener(this);
		ui.getSearchStartButton().addActionListener(this);
		ArrayList<JComboBox<String>> allCBs = ui.getAllComboboxes();
		for (int i = 0; i < allCBs.size(); i++) {
			allCBs.get(i).addActionListener(this);
			ui.getDeleteButtons().get(i).addActionListener(this);
		}
		ArrayList<JSlider> allSliders = ui.getAllSliders();
		for (int i = 0; i < allSliders.size(); i++) {
			allSliders.get(i).setName(String.valueOf(i));
			allSliders.get(i).addChangeListener(this);
		}
		ArrayList<JCheckBox[]> checkboxes = ui.getCheckBoxes();
		for (int i = 0; i < checkboxes.size(); i++) {
			for (int j = 0; j < checkboxes.get(i).length; j++) {
				checkboxes.get(i)[j].addItemListener(this);
			}
		}
		ui.getShowHouses().addItemListener(this);
		ui.getShowIcons().addItemListener(this);
	}

	/**
	 * This method sets the LoadingScreen visible.
	 */
	private void setLoadingScreen() {
		Container contentPane = getContentPane();
		screen = new LoadingScreen(contentPane);
		setGlassPane(screen);
		screen.setVisible(false);
	}

	/**
	 * Implementation of the ActionListener for the Button and the ComboBoxes.
	 * For each button and and the combobox, different methods are called to
	 * process the actions. All the methods concerninc actionPerfor-events can
	 * be found in the PerformAction-class.
	 * 
	 * @param e
	 *            ActionEvent
	 */
	@Override
	public void actionPerformed(ActionEvent e) {
		if (e.getSource() == ui.getCreateMapExtractButton()) {
			if (map.getZoom() > 13) {
				selectMap();
			} else {
				Dialog dialog = new Dialog(new JFrame(),
						TextValues.BIG_MAP_TITLE, appV);
				dialog.show(TextValues.BIG_MAP_TEXT,
						TextValues.TAKE_MAP_BUTTON,
						TextValues.TAKE_MAP_NOT_BUTTON,
						Values.DIALOG_WITHOUT_ANY);
				if (dialog.getParameter() == Values.POSITIVE) {
					selectMap();
				}
			}
		} else if (e.getSource() == ui.getNewParameterButton()) {
			pA.newParamterAction();
		} else if (e.getSource() == ui.getBackButton()) {
			restart();
		} else if (e.getSource() == ui.getHelpButton()) {
			pA.helpAction();
		} else if (e.getSource() == ui.getSearchStartButton()) {
			try {
				pA.searchAction(map);
			} catch (IOException e1) {
				e1.printStackTrace();
			}
		} else {
			for (int i = 0; i < ui.getDeleteButtons().size(); i++) {
				if (e.getSource() == ui.getDeleteButtons().get(i)) {
					pA.deleteAction(i);
					appV.resetNotFired();
					updateMap();
				}
			}
			if (!(e.getSource() instanceof JButton)) {
				@SuppressWarnings("unchecked")
				JComboBox<String> cb = (JComboBox<String>) e.getSource();
				pA.comboAction(cb, vA, mI);
				if (appV.getLatLonOfCustomParameter() != null) {
					float x = mtp.getXInMapBitmap(appV
							.getLatLonOfCustomParameter()[1]);
					float y = mtp.getYInMapBitmap(appV
							.getLatLonOfCustomParameter()[0]);
					appV.setCustomQuery(appV.getLayerToRefresh(), new int[] {
							(int) x, (int) y });
					Dialog dialog = new Dialog(new JFrame(),
							TextValues.CUSTOM_PARAMETER_NAME_TITLE, appV);
					dialog.show(TextValues.CUSTOM_PARAMETER_NAME_TEXT,
							TextValues.OK_BUTTON, null,
							Values.DIALOG_WITH_TEXTFIELD);
					appV.setCustomParameterName(dialog.getCustomParameterName());
					appV.setLatLonOfCustomParamter(null);
				}
				updateMap();
			}
		}
	}

	/**
	 * ChangeListener for the dilate- and importance-slider. For each change, a
	 * method in the PerformChange-class is called to perform the action.
	 * 
	 * @param e
	 *            ActionEvent
	 */
	@Override
	public void stateChanged(ChangeEvent e) {
		JSlider source = (JSlider) e.getSource();
		if (!source.getValueIsAdjusting()) {
			pC.performSliderChange(source);
			updateMap();
		}
	}

	/**
	 * ChangeListener for changes at any checkbox in the program.
	 */
	public void itemStateChanged(ItemEvent e) {
		JCheckBox source = (JCheckBox) e.getSource();
		if (source.getName() != null) {
			if (source.getName().equals("showHouses")) {
				if (source.isSelected() == true) {
					showHouses = true;
				} else {
					showHouses = false;
				}
			} else if (source.getName().equals("showIcons")) {
				if (source.isSelected() == true) {
					showIcons = true;
				} else {
					showIcons = false;
				}
			}
		} else {
			pC.performCheckBoxChange(source);
		}
		updateMap();
	}

	/**
	 * This method handles the click-event, when a user selects a position on
	 * the map in order to mark an own location at this point. In this case, a
	 * dialog is shown which gives the user the possibility to name his location
	 */
	@Override
	public void mouseClicked(MouseEvent e) {
		appV.setCustomQuery(appV.getLayerToRefresh(),
				new int[] { e.getX(), e.getY() });
		Dialog dialog = new Dialog(new JFrame(),
				TextValues.CUSTOM_PARAMETER_NAME_TITLE, appV);
		dialog.show(TextValues.CUSTOM_PARAMETER_NAME_TEXT,
				TextValues.OK_BUTTON, null, Values.DIALOG_WITH_TEXTFIELD);
		appV.setCustomParameterName(dialog.getCustomParameterName());
		updateMap();
	}

	@Override
	public void mouseEntered(MouseEvent arg0) {
	}

	@Override
	public void mouseExited(MouseEvent arg0) {

	}

	@Override
	public void mousePressed(MouseEvent e) {
	}

	@Override
	public void mouseReleased(MouseEvent arg0) {
	}

	/**
	 * This method handles all operations which are necessary to be performed
	 * after the user selected a map extract. This contains setting the
	 * LoadingScreen, downloading the information of the extract, downloading
	 * the static image of the chosen map extract and preparing the User
	 * Interface.
	 */
	private void selectMap() {
		screen.setVisible(true);
		new Thread(new Runnable() {
			public void run() {
				appV.setCode("afterSelection");
				createUI();
				screen.setProgressBar(25, TextValues.LOADING_MAP[0]);
				screen.revalidate();
				try {
					mI = new MapInformation(map.calculateBounds());
					mtp = new MapToPixel(mI);
				} catch (Exception e) {
					Dialog dialog = new Dialog(new JFrame(),
							TextValues.NO_CONNECTION_SERVER_TITLE, appV);
					dialog.show(TextValues.NO_CONNECTION_SERVER_TEXT,
							TextValues.OK_BUTTON, null,
							Values.DIALOG_WITHOUT_ANY);
					screen.setVisible(false);
					screen.revalidate();
					restart();
				}
				screen.setProgressBar(50, TextValues.LOADING_MAP[1]);
				hC = new HouseCalculation(mI, appV);
				hC.getHouseData();
				screen.setProgressBar(75, TextValues.LOADING_MAP[2]);
				try {
					createStaticImage();
				} catch (Exception e) {
					Dialog dialog = new Dialog(new JFrame(),
							TextValues.NO_CONNECTION_SERVER_TITLE, appV);
					dialog.show(TextValues.NO_CONNECTION_SERVER_TEXT,
							TextValues.OK_BUTTON, null,
							Values.DIALOG_WITHOUT_ANY);
					screen.setVisible(false);
					restart();
				}
				appV.setAllQueries(new ArrayList<String[]>());
				screen.setProgressBar(100, TextValues.LOADING_MAP[3]);
				ui.getQueryPanel().setVisible(true);
				ui.setCheckBoxes(appV.getParameterCount(), appV.getZoom());
				screen.setVisible(false);
				repaint();
			}
		}).start();
	}

	/**
	 * a static image is created with the given center-position and zoom.As this
	 * is the beginning of the calculations, all layers are created after
	 * calling the image.
	 */
	private void createStaticImage() {
		try {
			URL url = new URL(
					"http://open.mapquestapi.com/staticmap/v4/getmap?key=Kmjtd%7Cluu7n162n1%2C22%3Do5-h61wh&size="
							+ Values.WIDTH
							+ ","
							+ Values.HEIGHT
							+ "&zoom="
							+ map.getZoom()
							+ "&center="
							+ map.getCenterLat()
							+ "," + map.getCenterLon());
			img = ImageIO.read(url);
		} catch (IOException e) {
		}
		for (int i = 0; i < layers.length; i++) {
			createOverlays(i);
		}
		createMapExtract();
	}

	/**
	 * The static map as well as the overlays are packed into labels to be able
	 * to be integrated into a Java Swing environment.
	 */
	void createMapExtract() {
		staticMap = new JLabel(new ImageIcon(img));
		staticMap.setBounds(5, (Values.WINDOW_HEIGHT - Values.HEIGHT) / 5,
				Values.WIDTH, Values.HEIGHT);
		ui.getLayeredPane().add(staticMap, new Integer(0), 0);
		for (int i = 0; i < appV.getLayerLabels().length; i++) {
			appV.setLayerLabels(i, new OverlayLabel(layers[i],
					Values.TRANSPARENCY_LAYER));
			appV.getLayerLabels()[i].setBounds(5,
					(Values.WINDOW_HEIGHT - Values.HEIGHT) / 5, Values.WIDTH,
					Values.HEIGHT);
			ui.getLayeredPane().add(appV.getLayerLabels()[i],
					new Integer(i + 1), 0);
		}
		layerAllLabel = new OverlayLabel(layerAll, 0.4f);
		layerAllLabel.setBounds(5, (Values.WINDOW_HEIGHT - Values.HEIGHT) / 5,
				Values.WIDTH, Values.HEIGHT);
		ui.getLayeredPane().add(layerAllLabel,
				new Integer(appV.getLayerLabels().length + 1), 0);
		for (int j = 0; j < iconsLabels.length; j++) {
			iconsLabels[j] = new OverlayLabel(layerIcons[j], 1);
			iconsLabels[j].setBounds(5,
					(Values.WINDOW_HEIGHT - Values.HEIGHT) / 5, Values.WIDTH,
					Values.HEIGHT);
			ui.getLayeredPane().add(iconsLabels[j],
					new Integer(appV.getLayerLabels().length + 2 + j), 0);
		}
	}

	/**
	 * This method organizes the calculations. The overlay whose values has
	 * changed is refreshed an the new data are called and drawn. After that,
	 * all layers are summed up to calculate the best-region and draw the houses
	 * which are in that region. To get a better performance, these operations
	 * are split into Threads.
	 */
	protected void updateMap() {
		if (appV.getNotFired().size() == 0) {
			new Thread(new Runnable() {
				public void run() {
					screen.setVisible(true);
					CalculationThread cT = new CalculationThread(appV
							.getLayerToRefresh());
					cT.start();
					synchronized (lock) {
						while (!cT.isReady()) {
							try {
								lock.wait();
							} catch (InterruptedException e) {
								e.printStackTrace();
							}
						}
					}
					ArrayList<ArrayList<Float[]>> allHouses = hC
							.calculateBestRegion(queryCount,
									appV.getImportanceCount());
					if (showHouses == true && appV.getZoom() > 14) {
						Graphics2D g2d = (Graphics2D) layerAll.createGraphics();
						for (int i = 0; i < allHouses.size() - 1; i = i + 2) {
							new HouseThread(allHouses, i, g2d).start();
							new HouseThread(allHouses, i + 1, g2d).start();
						}
					}
					checkShowIconsSelected();
					screen.setVisible(false);
					repaint();
				}

			}).start();
		}
	}

	/**
	 * checks the status of the showIcons-checkbox and adapts the display of the
	 * icons of each layer.
	 */
	private void checkShowIconsSelected() {
		if (showIcons == true) {
			for (int i = 0; i < iconsLabels.length; i++) {
				iconsLabels[i].setVisible(true);
			}
		} else {
			for (int i = 0; i < iconsLabels.length; i++) {
				iconsLabels[i].setVisible(false);
			}
		}
	}

	/**
	 * In case of restarting and returning to the map, all configurations have
	 * to be reset.
	 */
	private void restart() {
		for (int i = 0; i < layers.length; i++) {
			createOverlays(i);
		}
		pA.restartAction();
		appV.setParameterCount(0);
		vA = new ValueAttribution(appV);
		img = null;
		repaint();
	}

	/**
	 * paint-method is called, as soon as the program changes. it directly
	 * passes to the update-method, in which all overlays are redrawn over the
	 * map with a specific transparency-value.
	 */
	public void paint(Graphics g) {
		super.paint(g);
		update(g);
	}

	public void update(Graphics g) {
		if (appV.getCode().equals("afterSelection")) {
			try {
				for (int i = 0; i < appV.getLayerLabels().length; i++) {
					appV.getLayerLabels()[i].setLayer(layers[i]);
				}
				layerAllLabel.setLayer(layerAll);
				for (int i = 0; i < iconsLabels.length; i++) {
					iconsLabels[i].setLayer(layerIcons[i]);
				}
			} catch (Exception e) {
			}
		}
	}

	/**
	 * Threads which perform the calculation process. It contains calling
	 * different methods to refresh the overlays, to adapt the query and to draw
	 * the amenities.
	 * 
	 * @author Judith Höreth
	 * 
	 */
	public class CalculationThread extends Thread {
		boolean ready = false;
		int layerToRefresh;

		public CalculationThread(int layerToRefresh) {
			this.layerToRefresh = layerToRefresh;
		}

		public void run() {
			screen.setProgressBar(10, TextValues.LOADING_MATCH[0]);
			createOverlays(layerToRefresh);
			queryCount = 0;
			for (int i = 0; i < appV.getSelectedItems().length; i++) {
				if (appV.getSelectedItems()[i] != ""
						&& appV.getSelectedItems()[i] != null) {
					queryCount++;
				}
			}
			screen.setProgressBar(30, TextValues.LOADING_MATCH[1]);
			ArrayList<String> actualQuery = new ArrayList<String>();
			for (int i = 0; i < appV.getAllQueries().size(); i++) {
				if (Integer.valueOf(appV.getAllQueries().get(i)[1]) == layerToRefresh) {
					actualQuery.add(appV.getAllQueries().get(i)[0]);
				}
			}
			for (int j = 0; j < actualQuery.size(); j++) {
				if (actualQuery.get(j).contains(",")) {
					String[] queriesArray = actualQuery.get(j).split(",");
					for (int i = 0; i < queriesArray.length; i++) {
						actualQuery.add(queriesArray[i]);
					}
				}
			}
			screen.setProgressBar(50, TextValues.LOADING_MATCH[2]);
			getDataOfGivenSearchQuery(actualQuery, layers[layerToRefresh],
					appV.getQueryValues()[layerToRefresh][1],
					appV.getQueryValues()[layerToRefresh][0],
					appV.getQueryValues()[layerToRefresh][2],
					appV.getCustomQuery(), layerToRefresh);
			screen.setProgressBar(70, TextValues.LOADING_MATCH[3]);
			sumUpALlLayers();
			hC.setLayer(layerAll);
			screen.setProgressBar(90, TextValues.LOADING_MATCH[4]);
			screen.revalidate();
			synchronized (lock) {
				ready = true;
				lock.notifyAll();
			}
		}

		public boolean isReady() {
			return ready;
		}
	}

	/**
	 * This Thread draws the houses, which are in the best-region. It receives an
	 * ArrayList of the houses to draw.
	 * 
	 */
	public class HouseThread extends Thread {
		ArrayList<ArrayList<Float[]>> allHouses;
		int number;
		Graphics2D g2d;

		public HouseThread(ArrayList<ArrayList<Float[]>> allHouses, int number,
				Graphics2D g2d) {
			this.allHouses = allHouses;
			this.number = number;
			this.g2d = g2d;
		}

		public void run() {
			g2d.setColor(new Color(0, 200, 0));
			try {
				GeneralPath polyline = new GeneralPath(
						GeneralPath.WIND_EVEN_ODD, allHouses.get(number).size());
				float yStart = mtp
						.getYInMapBitmap(allHouses.get(number).get(0)[0]);
				float xStart = mtp
						.getXInMapBitmap(allHouses.get(number).get(0)[1]);
				polyline.moveTo(xStart, yStart);
				for (int i = 1; i < allHouses.get(number).size(); i++) {
					float y = mtp
							.getYInMapBitmap(allHouses.get(number).get(i)[0]);
					float x = mtp
							.getXInMapBitmap(allHouses.get(number).get(i)[1]);
					polyline.lineTo(x, y);
				}
				g2d.fill(polyline);
			} catch (Exception e) {
			}
			try {
				sleep(100);
			} catch (InterruptedException e) {
			}
		}
	}
}
