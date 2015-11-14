/**
 * This class contains all constant values which represent some text within the
 * program, for example the text which is displayed in a dialog.
 * 
 * @author Judith H�reth
 * 
 */
public class TextValues {

	static final String TOO_MUCH_PARAMETER_TITLE = "Zu viele Parameter";
	static final String TOO_MUCH_PARAMETER_TEXT = "In dieser Anwendung sind nur vier Parameter m�glich!";

	static final String NEW_PARAMETER_TITLE = "Neuer Parameter";
	static final String NEW_PARAMETER_TEXT = "Bitte w�hlen Sie den Typ, den der neue Parameter annehmen soll!<br>(positiv: m�glichst nahe am zuk�nftigen Wohnort - negativ: m�glichst nicht im Gebiet des zuk�nftigen Wohnorts)";

	static final String CUSTOM_PARAMETER_TITLE = "Eigene �rtlichkeit festlegen";
	static final String CUSTOM_PARAMETER_TEXT = "Mit dieser Option k�nnen Sie eine eigene �rtlichkeit als Parameter festlegen <br> (z.B. Arbeitsplatz, Wohnhaus von Verwandten/Freunden, etc.).<br> Klicken Sie hierzu einfach auf den gew�nschten Ort in der Karte! Alternativ k�nnen Sie im folgenden Textfeld auch eine Adresse (Stra�e o.�.) eingeben.";

	static final String CUSTOM_PARAMETER_NAME_TITLE = "Eigener �rtlichkeit Namen geben";
	static final String CUSTOM_PARAMETER_NAME_TEXT = "Bitte gebe einen Namen f�r deine gew�hlte �rtlichkeit ein.";

	static final String HELP_TITLE = "Informationen zum Programm";
	static final String HELP_TEXT = "Hier k�nnen Sie f�r den von Ihnen gew�hlten Kartenausschnitt verschiedene Parameter w�hlen, die anschlie�end auf der Karte f�r Sie visualisiert werden. <br> Um einen neuen Parameter zu erstellen, dr�cken Sie auf den \"Neuer Parameter\"-Button. Nach Erstellung des Parameters k�nnen Sie diesen nach Ihren W�nschen anpassen.<br> Daf�r k�nnen Sie entweder eine Kategorie und die dazugeh�rigen Einrichtungen w�hlen oder aber �ber den Punkt \"Eigene �rtlichkeit\" einen eigenen Punkt auf der Karte markieren. <br> Zus�tzlich k�nnen Sie die gew�nschte Maximalentfernung sowie die Wichigkeit des Parameters einstellen. Sie k�nnen je nach Belieben bis zu vier Parameter miteinander kombinieren. Je nachdem wie viele der gew�hlten Parameter sich in der N�he befinden, desto deutlicher werden die Regionen markiert. In den als am besten ermittelten Regionen werden zus�tzlich die m�glichen H�user aufgezeigt. <br> Viel Spa�!";

	static final String OK_BUTTON = "OK";
	static final String PARAMETER_POSITVE_BUTTON = "positiver Parameter";
	static final String PARAMETER_NEGATIVE_BUTTON = "negativer Parameter";
	static final String START_BUTTON = "Gew�hlten Kartenausschnitt verwenden!";

	static final String BIG_MAP_TITLE = "Sehr gro�er Kartenausschnitt";
	static final String BIG_MAP_TEXT = "Dieser Kartenausschnitt ist sehr gro�. Da die Berechnung sehr viel Zeit in Anspruch nehmen wird, empfiehlt es sich, einen genaueren Kartenausschnitt zu w�hlen.";
	static final String TAKE_MAP_NOT_BUTTON = "Anderen Ausschnitt w�hlen";
	static final String TAKE_MAP_BUTTON = "Trotzdem fortfahren";

	static final String NO_CONNECTION_TITLE = "Keine Internetverbindung";
	static final String NO_CONNECTION_TEXT = "Leider kann das Programm momentan keine Internetverbindung herstellen.<br> Bitte �berpr�fen Sie ihre Verbindung und versuchen es anschlie�end noch einmal!";

	static final String NO_CONNECTION_SERVER_TITLE = "Server �berlastet";
	static final String NO_CONNECTION_SERVER_TEXT = "Leider ist der Server, der f�r die Datenbeschaffung genutzt wurd gegenw�rtig �berlastet. Dieses Problem tritt selten auf, kann aber vorkommen, <br>wenn gerade viele Leute diesen Dienst nutzen.<br>Bitte versuchen Sie es in ein paar Sekunden noch einmal!";

	static final String ADDRESS_NOT_FOUND_TITLE = "Adresse ung�ltig";
	static final String ADDRESS_NOT_FOUND_TEXT = "Die eingegebene Adresse konnte nicht gefunden werden! Bitte versuchen Sie es mit einer anderen Adresse oder �berpr�fen Sie Ihre Schreibweise!";

	static final String ADDRESS_RESULT_TITLE = "Gefundene Adressen";
	static final String ADDRESS_RESULT_TEXT = "Bitte w�hlen Sie eine der gefundenen Adressen aus!";

	static final String NO_TEXT_TITLE = "Leere Eingabe";
	static final String NO_TEXT_TEXT = "Bitte geben Sie einen Text in das passende Textfeld ein, bevor Sie auf \" Suchen \" klicken!";
	
	static final String[] LOADING_MAP = new String[] {
			"Karte wird heruntergeladen ... ", "Daten werden generiert ... ",
			"Karte wird erstellt ...", "Fertigstellen ... " };
	static final String[] LOADING_MATCH = new String[] {
			"Suchanfrage auswerten ... ", "Passe Suchanfrage an ...",
			"Hole Daten ... ", "Berechne ... ",
			"Finde Wohnobjekte/Regionen ... " };

	static final String WELCOME_TEXT = "Herzlich Willkommen bei BitMAPSearch! <br> Mit dieser Anwendung haben Sie die M�glichkeit, sich f�r die von Ihnen zuvor gew�hlten Parameter den idealen Wohnort anzeigen zu lassen. <br> Hierf�r m�ssen Sie zun�chst einen Kartenausschnitt ausw�hlen (es empfiehlt sich keine zu ungenauen Ausschnitte zu verwenden) und auf den Button klicken, der den Kartenausschnitt generiert. <br> Anschlie�end k�nnen Sie Parameter ausw�hlen, die Sich sich in der N�he w�nschen (z.B. Supermarkt, Bushaltestelle, etc.) und es wird der passende Wohnort berechnet.";
	static final String BACK_TO_MAP = "Zur�ck zur Karte";
	static final String NEW_PARAM = "neuer Parameter";
	static final String QUESTION = "?";
	static final String DELETE = "X";
	static final String SEARCH_START = "Suche!";

	static final String DISTANCE_SLIDER_TEXT_POS = "maximale Entfernung: ";
	static final String DISTANCE_SLIDER_TEXT_NEG = "minimale Entfernung: ";
	static final String IMPORTACNE_SLIDER_TEXT = "Wichtigkeit: ";

}
