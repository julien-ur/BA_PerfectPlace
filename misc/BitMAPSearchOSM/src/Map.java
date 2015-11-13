import java.awt.Dimension;
import java.util.ArrayList;

import org.jdesktop.swingx.JXMapKit;
import org.jdesktop.swingx.JXMapKit.DefaultProviders;
import org.jdesktop.swingx.mapviewer.DefaultTileFactory;
import org.jdesktop.swingx.mapviewer.GeoBounds;
import org.jdesktop.swingx.mapviewer.GeoPosition;
import org.jdesktop.swingx.mapviewer.TileFactoryInfo;
import org.jdesktop.swingx.mapviewer.util.GeoUtil;

/**
 * Creation of a map with different method to get some attributes of it. Bounds,
 * center-position and zoom can be obtained from defined method from the
 * swingx-library.
 * 
 * @author Judith Höreth
 * 
 */

public class Map {
	private JXMapKit mapKit;
	private static final TileFactoryInfo info = new TileFactoryInfo(0,
			Values.MAX_ZOOM - 2, Values.MAX_ZOOM, Values.TILES_SIZE, true,
			true, "http://otile1.mqcdn.com/tiles/1.0.0/osm", "x", "y", "z") {
		public String getTileUrl(int x, int y, int zoom) {
			zoom = Values.MAX_ZOOM - zoom;
			String url = this.baseURL + "/" + zoom + "/" + x + "/" + y + ".png";
			return url;
		}
	};
	private AppletValues appV;

	public Map(AppletValues appV) {
		this.appV = appV;
		mapKit = new JXMapKit();
		mapKit.setName("Map");
		mapKit.setPreferredSize(new Dimension(Values.WIDTH, Values.HEIGHT));
		mapKit.setDefaultProvider(DefaultProviders.Custom);
		mapKit.setTileFactory(new DefaultTileFactory(info));
		mapKit.setZoomButtonsVisible(false);
		mapKit.setCenterPosition(new GeoPosition(49.02116, 12.08409));
		mapKit.setZoom(5);
		mapKit.getMainMap().setOverlayPainter(null);
	}

	JXMapKit getMapKit() {
		return mapKit;
	}

	int getZoom() {
		int zoom = Values.MAX_ZOOM - mapKit.getMainMap().getZoom();
		appV.setZoom(zoom);
		return zoom;
	}

	float getCenterLat() {
		return (float) mapKit.getMainMap().getCenterPosition().getLatitude();
	}

	float getCenterLon() {
		return (float) mapKit.getMainMap().getCenterPosition().getLongitude();
	}

	ArrayList<String> calculateBounds() {
		ArrayList<String> bounds = new ArrayList<String>();
		GeoBounds pos = GeoUtil.getMapBounds(mapKit.getMainMap());
		bounds.add(String.valueOf(pos.getNorthWest().getLatitude()));
		bounds.add(String.valueOf(pos.getSouthEast().getLongitude()));
		bounds.add(String.valueOf(pos.getSouthEast().getLatitude()));
		bounds.add(String.valueOf(pos.getNorthWest().getLongitude()));
		return bounds;
	}
	
	void setCenterPosition(float lat, float lon){
		mapKit.setCenterPosition(new GeoPosition(lat,lon));
	}
}
