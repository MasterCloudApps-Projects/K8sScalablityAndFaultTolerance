package es.codeurjc.board.model;

import java.io.Serializable;

import org.springframework.data.annotation.Id;

public class Post implements Serializable{

	private static final long serialVersionUID = -4439114469417994311L;
	
	@Id
	private String id;

	private String user;
	private String title;
	private String text;
	
	public Post() {
	}

	public Post(String user, String title, String text) {
		super();
		this.user = user;
		this.title = title;
		this.text = text;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String name) {
		this.user = name;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getText() {
		return text;
	}

	public void setText(String content) {
		this.text = content;
	}

    @Override
    public String toString() {
        return String.format("Post{id=%s, user='%s', title=%s, description=%s}", id, user, title, text);
    }
}
