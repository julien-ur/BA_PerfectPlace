import java.util.ArrayList;

/**
 * This class runs the XMLParser class and separates the different information
 * it gets from the Parser. There are different methods for extracting the
 * Bounds, the Nodes and the Ways of a specific map and search-query. These
 * methods are called in the MapToPixel-Class.
 * 
 * @author Judith Höreth
 * 
 */

public class MapInformation extends XMLParser {
	XMLParser parser;
	ArrayList<Way> allWays;
	ArrayList<Node> allNodes;
	ArrayList<String> bounds;

	public MapInformation(ArrayList<String> bounds) {
		super(bounds);
		this.bounds = bounds;
		parser = new XMLParser(bounds);
		parser.run();
		allWays = parser.getAllWays();
		allNodes = parser.getAllNodes();
	}

	Bounds getBounds() {
		Bounds newBounds = parser.getNewBounds();
		return newBounds;
	}

	ArrayList<Integer> getAllWaysWithGivenTag(String v) {
		ArrayList<Integer> waysWithGivenTag = new ArrayList<Integer>();
		for (int i = 0; i < allWays.size(); i++) {
			if (allWays.get(i).getTags() != null) {
				for (int j = 0; j < allWays.get(i).getTags().size(); j++) {
					if (allWays.get(i).getTags().get(j).getV().equals(v)) {
						waysWithGivenTag.add(i);
					}
				}
			}
		}
		return waysWithGivenTag;
	}

	ArrayList<Integer> getAllHouses(String k, String v) {
		ArrayList<Integer> waysWithGivenTag = new ArrayList<Integer>();
		for (int i = 0; i < allWays.size(); i++) {
			if (allWays.get(i).getTags() != null) {
				for (int j = 0; j < allWays.get(i).getTags().size(); j++) {
					if (allWays.get(i).getTags().get(j).getV().equals(v)
							&& allWays.get(i).getTags().get(j).getK().equals(k)) {
						waysWithGivenTag.add(i);
					}
				}
			}
		}
		return waysWithGivenTag;
	}

	ArrayList<String> getAllNodesOfGivenWay(int position) {
		ArrayList<String> nodesOfGivenWay = new ArrayList<String>();
		for (int k = 0; k < allWays.get(position).getWayNodes().size(); k++) {
			nodesOfGivenWay.add(allWays.get(position).getWayNodes().get(k)
					.getRef());
		}
		return nodesOfGivenWay;
	}

	Float[] getLatLonOfGivenNode(String ref) {
		Float[] latLon = new Float[2];
		for (int i = 0; i < allNodes.size(); i++) {
			if (allNodes.get(i).getId().equals(ref)) {
				latLon[0] = allNodes.get(i).getLat();
				latLon[1] = allNodes.get(i).getLon();
			}
		}
		return latLon;
	}

	ArrayList<Float[]> getLatLonOfNodeWithTags(String v) {
		ArrayList<Float[]> nodeLatLonWithTag = new ArrayList<Float[]>();
		for (int i = 0; i < allNodes.size(); i++) {
			if (allNodes.get(i).getAllTags() != null) {
				for (int j = 0; j < allNodes.get(i).getAllTags().size(); j++) {
					if (allNodes.get(i).getAllTags().get(j).getV().equals(v)) {
						nodeLatLonWithTag.add(new Float[] {
								allNodes.get(i).getLat(),
								allNodes.get(i).getLon() });
					}
				}
			}
		}
		return nodeLatLonWithTag;
	}
}
