/**
 * This class contains all constant values which are used to manage all affairs
 * concerning the query.
 * 
 * @author Judith Höreth
 * 
 */

public class QueryValues {

	// values to query at the OpenStreetMap Server
	static final String QUERY_PARK = "park";
	static final String QUERY_FOREST = "forest";
	static final String QUERY_WOOD = "wood";
	static final String QUERY_RECREATION_GROUND = "recreation_ground";
	static final String QUERY_FARMLAND = "farmland";
	static final String QUERY_MEADOW = "meadow";
	static final String QUERY_RESERVOIR = "reservoir";
	static final String QUERY_NATURE = "nature reserve";
	static final String QUERY_FARM = "farm";

	static final String QUERY_RIVERBANK = "riverbank";
	static final String QUERY_WATER = "water";
	static final String QUERY_COASTLINE = "coastline";
	static final String QUERY_BAY = "bay";
	static final String QUERY_RIVER = "river";
	static final String QUERY_STREAM = "stream";

	static final String QUERY_PLAYGROUND = "playground";
	static final String QUERY_LIVING_STREET = "living_street";

	static final String QUERY_SUPERMARKET = "supermarket";
	static final String QUERY_MALL = "mall";
	static final String QUERY_BAKERY = "bakery";
	static final String QUERY_BUTCHER = "butcher";
	static final String QUERY_KIOSK = "kiosk";

	static final String QUERY_BUS_STOP = "bus_stop";
	static final String QUERY_BUS_STATION = "bus_station";
	static final String QUERY_TRAIN_STATION = "train_station";
	static final String QUERY_SUBWAY = "subway_entrance";
	static final String QUERY_TRAM_STOP = "tram_stop";
	static final String QUERY_MOTORWAY = "motorway";

	static final String QUERY_SPORTS = "sports_centre";
	static final String QUERY_TENNIS = "tennis";
	static final String QUERY_SOCCER = "soccer";
	static final String QUERY_BOXING = "boxing";
	static final String QUERY_DANCE = "dance";
	static final String QUERY_SWIMMING = "swimming_pool";
	static final String QUERY_WATER_PARK = "water_park";
	static final String QUERY_GYM = "gym";

	static final String QUERY_RESTAURANT = "restaurant";
	static final String QUERY_CAFE = "cafe";
	static final String QUERY_PUB = "pub";

	static final String QUERY_KINDERGARTEN = "kindergarten";
	static final String QUERY_SCHOOL = "school";
	static final String QUERY_UNIVERSITY = "university";

	static final String QUERY_DOCTOR = "doctors";
	static final String QUERY_HOSPITAL = "hospital";
	static final String QUERY_PHARMACY = "pharmacy";

	// values of the checkboxes which represent the selectable amenities. They
	// are split in the different available categories.
	static final String[] SHOPPING = new String[] { "Supermarkt", "Bäckerei",
			"Metzger", "Mall", "Kiosk" };
	static final String[] TRAFFIC = new String[] { "Bus", "Bahnhof",
			"Autobahn", "Ubahn", "Straßenbahn" };
	static final String[] NATURE = new String[] { "Park", "Wald", "Felder",
			"Wasser" };
	static final String[] EDUCATION = new String[] { "Kindergarten", "Schule",
			"Universität" };
	static final String[] SPORTS = new String[] { "Schwimmbad", "Sportverein",
			"Tennis", "Fußball", "Boxen", "Tanzen" };
	static final String[] GASTRONOMY = new String[] { "Restaurant", "Café",
			"Bar" };
	static final String[] MEDICINE = new String[] { "Arzt", "Krankenhaus",
			"Apotheke" };
	static final String[] CHILDREN = new String[] { "Spielplatz", "Spielstraße" };

	// categories which can be chosen by the user
	static final String[] AMENITIES = new String[] { "", "Einkaufen", "Natur",
			"Verkehr", "Bildung", "Sport", "Gastronomie", "Medizin", "Kinder",
			"Eigene Örtlichkeit" };
	// categories with appropriate amenities
	static final String[][] ALL_SUB_AMENITIES = new String[][] { null,
			SHOPPING, NATURE, TRAFFIC, EDUCATION, SPORTS, GASTRONOMY, MEDICINE,
			CHILDREN, null };

	// summary of all queries, sorted by the order of the UI elements(note: some
	// queries are composed by more single queries, for
	// example "wood" and "forest")
	static final String[][] ALL_QUERIES = new String[][] {
			{ "" },
			{ QUERY_SUPERMARKET, QUERY_BAKERY, QUERY_BUTCHER, QUERY_MALL,
					QUERY_KIOSK },
			{
					QUERY_PARK,
					QUERY_FOREST + "," + QUERY_WOOD,
					QUERY_FARMLAND + "," + QUERY_MEADOW + "," + QUERY_RESERVOIR
							+ "," + QUERY_NATURE + "," + QUERY_FARM,
					QUERY_RIVERBANK + "," + QUERY_WATER + "," + QUERY_RIVER
							+ "," + QUERY_STREAM + "," + QUERY_COASTLINE + ","
							+ QUERY_BAY },
			{ QUERY_BUS_STOP + "," + QUERY_BUS_STATION, QUERY_TRAIN_STATION,
					QUERY_MOTORWAY, QUERY_SUBWAY, QUERY_TRAM_STOP },
			{ QUERY_KINDERGARTEN, QUERY_SCHOOL, QUERY_UNIVERSITY },
			{ QUERY_SWIMMING, QUERY_GYM + "," + QUERY_SPORTS, QUERY_TENNIS,
					QUERY_SOCCER, QUERY_BOXING, QUERY_DANCE },
			{ QUERY_RESTAURANT, QUERY_CAFE, QUERY_PUB },
			{ QUERY_DOCTOR, QUERY_HOSPITAL, QUERY_PHARMACY },
			{ QUERY_PLAYGROUND, QUERY_LIVING_STREET }, { "" } };

	//summary of the paths of all icons, sorted by the order of the UI elements
	static final String[][] ALL_ICONS = new String[][] {
			null,
			{ "supermarket_w.png", "bakery_w.png", "butcher_w.png",
					"mall_w.png", "kiosk_w.png" },
			{ "park_w.png", "forest_w.png", "grass_w.png", "water_w.png" },
			{ "bus_w.png", "train_w.png", "highway_w.png", "subway_w.png",
					"tram_w.png" },
			{ "kindergarden_w.png", "school_w.png", "university_w.png" },
			{ "swim_w.png", "sports_w.png", "tennis_w.png", "soccer_w.png",
					"boxing_w.png", "dancing_w.png" },
			{ "restaurant_w.png", "coffee_w.png", "pub_w.png" },
			{ "doctor_w.png", "hospital_w.png", "pharmacy_w.png" },
			{ "playground_w.png", "livingstreet_w.png" } };

}
