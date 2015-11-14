import java.awt.image.BufferedImage;
import java.util.ArrayList;

/**
 * Calculation of houses, which are within the "best-match"-region.
 * 
 * @author Judith Höreth
 * 
 */
public class HouseCalculation {
	BufferedImage layerAll;
	private ArrayList<Integer> waysWithAllHousesTags, waysWithTagYes,
			waysWithTagApartment, waysWithTagHouse, waysWithTagTerrace,
			waysWithHouseNumbers;
	private ArrayList<String> allNodesOfWay;
	private ArrayList<Float[]> allLatLon;
	private ArrayList<ArrayList<Float[]>> allLatLonHouses;
	private MapInformation mI;
	static Float[] latLon;
	private MapToPixel mtp;
	private AppletValues appV;
	ArrayList<Integer[]> region;
	private final Object lockH = new Object();
	private final Object lockCH = new Object();
	private ArrayList<ArrayList<Float[]>> allHouses;

	public HouseCalculation(MapInformation mI, AppletValues appV) {
		this.mI = mI;
		this.appV = appV;
		mtp = new MapToPixel(mI);
		allLatLonHouses = new ArrayList<ArrayList<Float[]>>();
	}

	void setLayer(BufferedImage layerAll) {
		this.layerAll = layerAll;
	}

	/**
	 * Call of the getBestRegion()-method, which calculates the best-match-area
	 * of the given layer(here: layerAll, which contains all available layers)
	 * Results are saved and used for the getHouseData()-method.
	 * 
	 * @param queryCount
	 *            number of chosen amenities for the query
	 * @param countImportance
	 *            number of all chosen important-values
	 * @return List with all pixels, which grey-value is bigger than the
	 *         BEST_MATCH_VALUE (defined in the Values-class).
	 */
	ArrayList<ArrayList<Float[]>> calculateBestRegion(int queryCount,
			int[] countImportance) {
		Filter filter = new Filter(appV);
		region = new ArrayList<Integer[]>();
		region = filter.getBestRegion(layerAll, queryCount, countImportance);
		ArrayList<ArrayList<Float[]>> regionHouseData = new ArrayList<ArrayList<Float[]>>();
		if (appV.getZoom() > 14) {
			regionHouseData = calculateHousesInRegion(region);
		}
		return regionHouseData;
	}

	/**
	 * Similar to the getData()-method from the Applet-class, objects, which are
	 * defined as houses, are searched and the found data are saved into a list.
	 * As there are many descriptors for "houses"(esp. apartment, house,
	 * building), the house-list is first prepared to sum up all objects which
	 * define a house or a living object.
	 */
	void getHouseData() {
		prepareHouseList();
		for (int i = 0; i < waysWithAllHousesTags.size(); i++) {
			allNodesOfWay = mI.getAllNodesOfGivenWay(waysWithAllHousesTags
					.get(i));
			allLatLon = new ArrayList<Float[]>();
			for (int j = 0; j < allNodesOfWay.size(); j++) {
				latLon = mI.getLatLonOfGivenNode(allNodesOfWay.get(j));
				allLatLon.add(latLon);
			}
			allLatLonHouses.add(allLatLon);
		}
	}

	/**
	 * All houses, which are in the given region (at least one node of the
	 * house), are calculated and saved to a list. The calculation is split into
	 * threads to accelerate the process.
	 * 
	 * @param region
	 *            the given best-match region
	 * @return a list with all houses that are within the best-match area
	 */
	ArrayList<ArrayList<Float[]>> calculateHousesInRegion(
			ArrayList<Integer[]> region) {
		allHouses = new ArrayList<ArrayList<Float[]>>();
		HouseSearchingThread hST = new HouseSearchingThread();
		hST.start();
		synchronized (lockH) {
			while (!hST.isReady()) {
				try {
					lockH.wait();
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
		}
		return allHouses;
	}

	/**
	 * All tags which define a type of a house are found and merged to one list.
	 */
	private void prepareHouseList() {
		waysWithAllHousesTags = new ArrayList<Integer>();
		waysWithTagYes = mI.getAllHouses("building", "yes");
		waysWithTagApartment = mI.getAllHouses("building", "apartments");
		waysWithTagHouse = mI.getAllHouses("building", "house");
		waysWithTagTerrace = mI.getAllHouses("building", "terrace");
		waysWithHouseNumbers = mI.getAllHouses("addr:housenumber", ".*");
		waysWithAllHousesTags.addAll(waysWithTagYes);
		waysWithAllHousesTags.addAll(waysWithTagApartment);
		waysWithAllHousesTags.addAll(waysWithTagHouse);
		waysWithAllHousesTags.addAll(waysWithTagTerrace);
		waysWithAllHousesTags.addAll(waysWithHouseNumbers);

	}

	/**
	 * This threads manage the process of the calculation of houses, which are
	 * in the best-match area. Therefore, two threads are started parallel and
	 * walk through the list, which contains all houses of the map extract.If one
	 * node of a house is within the best-match area, it is saved to a separated
	 * list to be drawn later.
	 * 
	 * @author Judith Höreth
	 * 
	 */
	public class HouseSearchingThread extends Thread {
		boolean ready = false;
		CheckHousesInRegionThread[] cHiRT = new CheckHousesInRegionThread[10];

		public void run() {
			CheckHousesInRegionThread cHT = new CheckHousesInRegionThread(0,
					allLatLonHouses.size() / 2);
			cHT.start();
			CheckHousesInRegionThread cHT2 = new CheckHousesInRegionThread(
					allLatLonHouses.size() / 2, allLatLonHouses.size());
			cHT2.start();
			synchronized (lockCH) {
				while (!cHT.isReady() && !cHT2.isReady()) {
					try {
						lockCH.wait();
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
				}
			}
			synchronized (lockH) {
				ready = true;
				lockH.notifyAll();
			}
		}

		public boolean isReady() {
			return ready;
		}
	}

	public class CheckHousesInRegionThread extends Thread {
		int start, end;
		boolean ready = false;

		public CheckHousesInRegionThread(int start, int end) {
			this.start = start;
			this.end = end;
		}

		public void run() {
			boolean isHouse = false;
			for (int i = start; i < end; i++) {
				for (int k = 0; k < allLatLonHouses.get(i).size(); k++) {
					float y = mtp
							.getYInMapBitmap(allLatLonHouses.get(i).get(k)[0]);
					float x = mtp
							.getXInMapBitmap(allLatLonHouses.get(i).get(k)[1]);
					for (int m = 0; m < region.size(); m++) {
						if (region.get(m) != null) {
							if (x < region.get(m)[0] + 1
									&& x > region.get(m)[0] - 1
									&& y < region.get(m)[1] + 1
									&& y > region.get(m)[1] - 1) {
								isHouse = true;
							}
						}
					}
					if (isHouse == true) {
						allHouses.add(allLatLonHouses.get(i));
					}
					isHouse = false;
				}
			}
			synchronized (lockCH) {
				ready = true;
				lockCH.notifyAll();
			}
		}

		public boolean isReady() {
			return ready;
		}
	}
}
