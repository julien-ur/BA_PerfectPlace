import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;

import org.xml.sax.Attributes;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.DefaultHandler;
import org.xml.sax.helpers.XMLReaderFactory;

/**
 * The XMLParser uses SAX to extract the different elements from the given
 * OpenStreetMap-File. It saves the different elements in ArrayLists which can
 * be queried in the MapInformation-Class
 * 
 * @author Judith Höreth
 * 
 */
public class XMLParser extends DefaultHandler {
	ArrayList<Way> allWays;
	ArrayList<Node> allNodes;
	ArrayList<Tag> allTags;
	ArrayList<WayNode> allWayNodes;
	String tempVal;
	Bounds newBounds;
	Way newWay;
	Tag newTag;
	WayNode newWayNode;
	Node newNode;
	ArrayList<Tag> allNodeTags;
	private ArrayList<String> bounds;

	public XMLParser(ArrayList<String> bounds) {
		this.bounds = bounds;
		allWays = new ArrayList<Way>();
		allNodes = new ArrayList<Node>();
	}

	public void run() {
		parseDocument();
	}

	private void parseDocument() {
		try {
			XMLReader myReader = XMLReaderFactory.createXMLReader();
			myReader.setContentHandler(this);
			myReader.parse(new InputSource(new URL(
					"http://overpass-api.de/api/map?bbox=" + bounds.get(0)
							+ "," + bounds.get(1) + "," + bounds.get(2) + ","
							+ bounds.get(3)).openStream()));
		} catch (SAXException se) {
			se.printStackTrace();
		} catch (IOException ie) {
			ie.printStackTrace();
		}
	}

	public void startElement(String uri, String localName, String qName,
			Attributes attributes) throws SAXException {
		tempVal = "";
		if (qName.equalsIgnoreCase("bounds")) {
			newBounds = new Bounds();
			newBounds
					.setMinlat(Float.parseFloat(attributes.getValue("minlat")));
			newBounds
					.setMinlon(Float.parseFloat(attributes.getValue("minlon")));
			newBounds
					.setMaxlat(Float.parseFloat(attributes.getValue("maxlat")));
			newBounds
					.setMaxlon(Float.parseFloat(attributes.getValue("maxlon")));

		} else if (qName.equalsIgnoreCase("way")) {
			newWay = new Way();
			try{
			newWay.setId(Integer.parseInt(attributes.getValue("id")));
			newWay.setVisible(Boolean.parseBoolean(attributes
					.getValue("visible")));
			}
			catch(NumberFormatException e) {
				System.err.printf("Idstring ist fehlerhaft - kann nicht aufgenommen werden!");		}
			allWayNodes = new ArrayList<WayNode>();
			allTags = new ArrayList<Tag>();
		} else if (qName.equalsIgnoreCase("tag")) {
			newTag = new Tag();
			try {
				newTag.setK(attributes.getValue("k"));
				newTag.setV(attributes.getValue("v"));
			} catch (NumberFormatException e) {
				System.err.printf("Tagstring ist fehlerhaft - kann nicht aufgenommen werden!");
			}
		} else if (qName.equalsIgnoreCase("nd")) {
			newWayNode = new WayNode();
			try {
				newWayNode.setRef(attributes.getValue("ref"));
			} catch (NumberFormatException e) {
				System.err.printf("Referenzstring ist fehlerhaft - kann nicht aufgenommen werden!");
			}
		} else if (qName.equalsIgnoreCase("node")) {
			newNode = new Node();
			newNode.setId(attributes.getValue("id"));
			newNode.setVisible(Boolean.parseBoolean(attributes
					.getValue("visible")));
			try {
				newNode.setLat(Float.parseFloat(attributes.getValue("lat")));
				newNode.setLon(Float.parseFloat(attributes.getValue("lon")));
			} catch (NumberFormatException e) {
				System.err.printf("Nodestring ist fehlerhaft - kann nicht aufgenommen werden!");
			}
			allNodeTags = new ArrayList<Tag>();
		} else if (qName.equalsIgnoreCase("relation")) {
			allTags = new ArrayList<Tag>();
		}
	}

	public void characters(char[] ch, int start, int length)
			throws SAXException {
		tempVal = new String(ch, start, length);
	}

	public void endElement(String uri, String localName, String qName)
			throws SAXException {

		if (qName.equalsIgnoreCase("way")) {
			allWays.add(newWay);
			newWay = new Way();
		} else if (qName.equalsIgnoreCase("node")) {
			allNodes.add(newNode);
			newNode = new Node();
		} else if (qName.equalsIgnoreCase("nd")) {
			allWayNodes.add(newWayNode);
			newWay.setWayNodes(allWayNodes);
		} else if (qName.equalsIgnoreCase("tag")) {
			if (allTags != null && newWay != null) {
				allTags.add(newTag);
				newWay.setTags(allTags);
			} else if (allNodeTags != null && newNode != null) {
				allNodeTags.add(newTag);
				newNode.setTags(allNodeTags);
			}
		}
	}

	public ArrayList<Way> getAllWays() {
		return allWays;
	}

	public ArrayList<Node> getAllNodes() {
		return allNodes;
	}

	public Bounds getNewBounds() {
		return newBounds;
	}

}
