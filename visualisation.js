
  // RELATIONS of links
  // possesseur/entreprise/personne sur groupe 
    var color1 = "orange";
    var color2 = "green";
    var color = d3.scale.ordinal()
    .domain(["Commun/partagé", "Unique/selectionné"])
    .range([color1,color2]);
    console.log(d3.scale.category10());
  var POSSESSEUR_GROUPE = 0;
  // possesseur/entreprise/personne sur media 
  var POSSESSEUR_MEDIA = 1;
  // GROUPE sur GROUPE  
  var GROUPE_GROUPE = 2;
  // GROUPE sur MEDIA  
  var GROUPE_MEDIA = 3;
  var DECALLAGE = 200;
  
  // TYPES OF NODES

  var POSSESSOR = 0;
  var GROUP = 1;
  var MEDIA = 2;
  
  var nodes = [];
  var links = [];

  var data = [];

  var datacsv;
  var treeData=[];
  var datajsonArray = [];
  function validName(name){
    return name.indexOf("%") == -1 && name !="" && name !="Contrôle";
  }
  function Node(id,name, type) {
    this.id = id;
    this.name = name;
    this.type = type;
  };
  function getMedias(){
    return nodes.filter(function(e){return e.type==MEDIA});
  }
  function getGroups(){
    return nodes.filter(function(e){return e.type==GROUP});
  }
  function getPossessors(){
    return nodes.filter(function(e){return e.type==POSSESSOR});
  }
  function getId(name){
    for(var i in nodes){
      if(nodes[i].name == name){
        return nodes[i].id;
      }
    }
    return -1;
  }
  
  function Link(id, source, target,value,niveau,relation) {
    this.id=id;
    this.source  = source ;
    this.target  = target ;
    this.niveau = niveau ;
    this.value = value ;
    this.relation = relation ;
  };
  function get_links(source,relation){
    return links.filter(function(d){return d.source ==source && d.relation ==relation});
  }
    function get_link_source_target(source,target){
    return links.filter(function(d){return d.source ==source && d.target ==target});
  }
    function get_target_source(source){
    return links.filter(function(d){return d.source ==source});
  }
  function get_links_byRelation(relation){
    return links.filter(function(d){return d.relation ==relation});
  }
  function makeTransitionLinks(){

    // Augmentation du nombre de liens par transitivité
    var todo = {};
    for (var i=0;i<=3;i++){
      console.log("debut", links.length)
      for(var l in links){

        var links_from_targets = get_target_source(links[l].target);
        links_from_targets=links_from_targets.filter(function(d){
          return d.relation !=POSSESSEUR_MEDIA;
        });
        var debug = false;
        if(links[l].source == "Fondation Varenne"){
          debug = true;
          //console.log("Fondation",links[l]);
        }
        if(links[l].target == "Groupe NRCO"){
          console.log("Groupe NRCO",links_from_targets);
        }
        
        for(var j in links_from_targets){
            var relation;
            var add_group = false;
           if(links[l].relation == POSSESSEUR_GROUPE && links_from_targets[j].relation == GROUPE_GROUPE){
             relation = POSSESSEUR_GROUPE;
             add_group=true;
           }
           else if(links[l].relation == GROUPE_GROUPE && links_from_targets[j].relation == GROUPE_GROUPE){
             relation = GROUPE_GROUPE;
             add_group=true;
           }
           else if(links[l].relation == POSSESSEUR_GROUPE && links_from_targets[j].relation == GROUPE_MEDIA){
             relation = POSSESSEUR_MEDIA;
           }

          if(debug){
            console.log(links[l].source,links_from_targets[j].target,links[l].value,-1,relation);
          }
         var ajout = add_link(links[l].source,links_from_targets[j].target,links[l].value,-1,relation);
         if(ajout&&debug){
          console.log(links[l].source,links_from_targets[j].target,links[l].value,-1,relation);
         }
        }
      }
    
   console.log("fin")
   }
  }
    
  function add_node(name,type){
    if(!validName(name)){
      return;
    }
    for(var node in nodes){
      if(nodes[node].name == name){
        return;
      }
    }

    nodes.push(new Node(nodes.length,name,type));
  }
  function add_link(source,target,niveau,value,participe,relation){
    for(var link in links){
      if(links[link].source == source && links[link].target == target){
        return false;
      }
    }
    links.push(new Link(links.length,source,target,niveau,value,participe,relation));
    return true;
  }
  d3.dsv(';')("basemedia.csv", function(error, csv) {
    if (error) return console.warn(error);
    datacsv = csv;

    for (var prop in datacsv) {
      var ligne =datacsv[prop];
      var node1 = ligne["Proprietaire final NOM"];
      add_node(ligne["Proprietaire final NOM"],POSSESSOR);
      add_node(ligne["3e etage NOM"],GROUP);
      add_node(ligne["2e etage NOM"],GROUP);
      add_node(ligne["1er etage NOM"],GROUP);
      add_node(ligne["Media NOM"],MEDIA);
      var premier = false;
      var deuxieme = false;
      var troisieme = false;
      if(validName(ligne["3e etage NOM"])){
        troisieme = true;
        var value = ligne["Proprietaire final %"];
        var source = ligne["Proprietaire final NOM"];
        var target = ligne["3e etage NOM"];
        add_link(source,target,value,0,POSSESSEUR_GROUPE);
      }
      if(validName(ligne["2e etage NOM"])){
        deuxieme= true;
            // possesseur vers groupe n°2
            var value = Math.max(ligne["Proprietaire final %"],ligne["3e etage %"]);
            var source = ligne["Proprietaire final NOM"];
            var target = ligne["2e etage NOM"];
            add_link(source,target,value,1,POSSESSEUR_GROUPE);// mettre de niveau 0 si il y a rien eu avant ? 
            
            // groupe 3 vers groupe 2
            if(troisieme){
              var value = ligne["3e etage %"];
              var source = ligne["3e etage NOM"];
              var target = ligne["2e etage NOM"];
              add_link(source,target,value,0,GROUPE_GROUPE);
            }
        }
        if(validName(ligne["1er etage NOM"])){
          if(ligne["1er etage NOM"] == "Groupe NRCO"){
            console.log("FOUNDED",ligne["1er etage NOM"])
          }
          var value = ligne["2e etage %"];
          premier= true;
            // possesseur vers groupe n°1
            var value = Math.max(ligne["Proprietaire final %"],ligne["3e etage %"],ligne["2e etage %"]);
            var source = ligne["Proprietaire final NOM"];
            var target = ligne["1er etage NOM"];
            add_link(source,target,value,2,POSSESSEUR_GROUPE);// mettre de niveau 0 si il y a rien eu avant ? 
            
            // groupe 3 vers groupe 1
            if(troisieme){
              var value = Math.max(ligne["3e etage %"],ligne["2e etage %"]);
              var source = ligne["3e etage NOM"];
              var target = ligne["1er etage NOM"];
              add_link(source,target,value,1,GROUPE_GROUPE);
            }
            // groupe 2 vers groupe 1
            if(deuxieme){
              var value = ligne["2e etage %"];
              var source = ligne["2e etage NOM"];
              var target = ligne["1er etage NOM"];
              add_link(source,target,value,0,GROUPE_GROUPE);
            }
        }
          // on passe au media
          // possesseur => media
          var value = Math.max(ligne["Proprietaire final %"],ligne["3e etage %"],ligne["2e etage %"],ligne["1er etage %"]);
          var source = ligne["Proprietaire final NOM"];
          var target = ligne["Media NOM"];
          add_link(source,target,value,3,POSSESSEUR_MEDIA);
          // groupe 3 => media
          if(troisieme){
            var value = Math.max(ligne["3e etage %"],ligne["2e etage %"],ligne["1er etage %"]);
            var source = ligne["3e etage NOM"];
            var target = ligne["Media NOM"];
            add_link(source,target,value,2,GROUPE_MEDIA);
          }
    // groupe 2 => media
    if(deuxieme){
      var value = Math.max(ligne["2e etage %"],ligne["1er etage %"]);
      var source = ligne["2e etage NOM"];
      var target = ligne["Media NOM"];
      add_link(source,target,value,2,GROUPE_MEDIA);
    }
    // groupe 1=> media
    if(premier){
      var value = ligne["1er etage %"];
      var source = ligne["1er etage NOM"];
      var target = ligne["Media NOM"];
      add_link(source,target,value,0,GROUPE_MEDIA);


    }



  }
  makeTransitionLinks();

  var mapouter = d3.map();
  var mapouterID = d3.map();
  var mapinner = d3.map();
  var new_links =[];

  getPossessors().forEach(function(d){

    if (d == null)
      return;

    i = { id: 'i' + d.id, name: d.name, related_links: [] };
    i.related_nodes = [i.id];
    mapinner.set(i.id,i);



    get_links(i.name,POSSESSEUR_MEDIA).forEach(function(d1){


      var o;
      if(mapouter.get(d1.target) == undefined){
        o = { name: d1.target,  id: 'o' + getId(d1.target), related_links: [] };
        o.related_nodes = [o.id]; 
        mapouter.set(d1.target, o);
        mapouterID.set(o.id, o);
      }else{

        o=mapouter.get(d1.target);
      }



    // create the links
    l = { id: 'l-' + i.id + '-' + o.id, inner: i, outer: o }
    new_links.push(l);

    // and the relationships
    i.related_nodes.push(o.id);
    i.related_links.push(l.id);
    o.related_nodes.push(i.id);
    o.related_links.push(l.id);
    mapouter.set(d1.target, o);
  });
      });
    
    
    
        
      
      
    

  data = {
    inner: mapinner.values(),
    outer: mapouter.values(),
    links: new_links
  }

  // sort the data -- TODO: have multiple sort options
  outer = data.outer;
  data.outer = Array(outer.length);


  var i1 = 0;
  var i2 = outer.length - 1;

  for (var i = 0; i < data.outer.length; ++i)
  {
    if (i % 2 == 1)
      data.outer[i2--] = outer[i];
    else
      data.outer[i1++] = outer[i];
  }




  // from d3 colorbrewer: 
  // This product includes color specifications and designs developed by Cynthia Brewer (http://colorbrewer.org/).


  var diameter = 1200;
  var rect_width = 180;
  var rect_height = 14;

  var link_width = "1px"; 

  var il = data.inner.length;
  var ol = data.outer.length;

  var inner_y = d3.scale.linear()
  .domain([0, il])
  .range([-(il * rect_height)/2, (il * rect_height)/2]);

  mid = (data.outer.length/2.0)
  var outer_x = d3.scale.linear()
  .domain([0, mid, mid, data.outer.length])
  .range([15, 165, 195 ,345]);

  var outer_y = d3.scale.log()
  .domain([0, ol])
  .range([diameter / 3, 500 ]);

  // setup positioning
  function elipse(distance,i, max){
    var coeffsin = 0.3;
    var coeff = Math.sin(i/max * Math.PI)*coeffsin+1;
    return distance*(coeff);
  }
  data.outer = data.outer.map(function(d, i) { 
    d.x = outer_x(i);
    if(d.x>180){
      d.y = elipse(diameter/3,i-ol/2,ol/2);
    }else{
      d.y = elipse(diameter/3,i,ol/2);  
    }

      //d.y = diameter/3;// distance
      return d;
  });

  data.inner = data.inner.map(function(d, i) { 
    d.x = -(rect_width / 2);
    d.y = inner_y(i);
    return d;
  });

  function get_color(name)
  {
    var c = Math.round(color(name));
    if (isNaN(c))
          return '#dddddd'; // fallback color

      return colors[c];
  }

  // Can't just use d3.svg.diagonal because one edge is in normal space, the
  // other edge is in radial space. Since we can't just ask d3 to do projection
  // of a single point, do it ourselves the same way d3 would do it. 
    
    var zoom = d3.behavior.zoom()
    .scaleExtent([-1, 2])
    .on("zoom", zoomed);
    function zoomed() {
      svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    

var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);
    function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
      d3.select(this).classed("dragging", true);
    }

    function dragged(d) {
      d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }

    function dragended(d) {
      d3.select(this).classed("dragging", false);
    }


  function projectX(x)
  {
    return ((x - 90) / 180 * Math.PI) - (Math.PI/2);
  }


  var diagonal = d3.svg.diagonal()
  .source(function(d) {return {"x": d.outer.y * Math.cos(projectX(d.outer.x)), 
    "y": -d.outer.y * Math.sin(projectX(d.outer.x))}; })            
  .target(function(d) { return {"x": d.inner.y + rect_height/2,
    "y": d.outer.x > 180 ? d.inner.x : d.inner.x + rect_width}; })
  .projection(function(d) { return [d.y, d.x]; });


  var svg = d3.select("#content").append("svg")
  .attr("width", diameter*1.3)
  .attr("height", diameter)
  .call(zoom)
  .append("g")
  .attr("transform", "translate(" + ((diameter / 2) +DECALLAGE) + "," + (diameter / 2)+ ")");


  // links
  var link = svg.append('g').attr('class', 'links').selectAll(".link")
  .data(data.links)
  .enter().append('path')
  .attr('class', 'link')
  .attr('id', function(d) { return d.id })
  .attr("d", diagonal)
  .attr('stroke', function(d) { return get_color(d.inner.name); })
  .attr('stroke-width', link_width);

  // outer nodes

  var onode = svg.append('g').selectAll(".outer_node")
  .data(data.outer)
  .enter().append("g")
  .attr("class", "outer_node")
  .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
  .on("mouseover", mouseover)
  .on("mouseout", mouseout);

  onode.append("circle")
  .attr('id', function(d) { return d.id })
  .attr("r", 4.5);

  onode.append("circle")
  .attr('r', 20)
  .attr('visibility', 'hidden');

  onode.append("text")
  .attr('id', function(d) { return d.id + '-txt'; })
  .attr("dy", ".31em")
  .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
  .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
  .attr('fill', function(d) { return "white"; })
  .text(function(d) { return d.name; });

  // inner nodes

  var inode = svg.append('g').selectAll(".inner_node")
  .data(data.inner)
  .enter().append("g")
  .attr("class", "inner_node")
  .attr("transform", function(d, i) { return "translate(" + d.x + "," + d.y + ")"})
  .on("mouseover", mouseover)
  .on("mouseout", mouseout);

  inode.append('rect')
  .attr('width', rect_width)
  .attr('height', rect_height)
  .attr('id', function(d) { return d.id; })
  .attr('fill', function(d) { return "white"; });

  inode.append("text")
  .attr('id', function(d) { return d.id + '-txt'; })
  .attr('text-anchor', 'middle')
  .attr("transform", "translate(" + rect_width/2 + ", " + rect_height * .75 + ")")
  .text(function(d) { return d.name; });

  var legend = svg.selectAll(".legend")
     .data(["Commun/partagé", "Unique/selectionné"])//hard coding the labels as the datset may have or may not have but legend should be complete.
.enter().append("g")
     .attr("class", "legend")
     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

// draw legend colored rectangles
legend.append("rect")
     .attr("x", -(rect_width / 2) + rect_width / 2 + 50)
     .attr("y", -diameter/2+100)
     .attr("width", 18)
     .attr("height", 18)
     .style("fill", function(d){return color(d)});

// draw legend text
legend.append("text")
     .attr("x", -(rect_width / 2) + rect_width / 2 - 16 + 50)
     .attr("y", -diameter/2+100+10)
     .attr("dy", ".35em")
     .style("text-anchor", "end")
     .style("fill","white")
     .text(function(d) { return d;});

  // need to specify x/y/etc

  d3.select(self.frameElement).style("height", diameter - 150 + "px");

  function mouseover(d)
  {
    for (var i = 0; i < d.related_nodes.length; i++)
    {
      var obj = mapinner.get(d.related_nodes[i])||mapouterID.get(d.related_nodes[i]);
      
      colorALL(obj,true,false,d.id);
    }
    colorALL(d,false,true,undefined);

  }
  function colorNode(d,extend, first, from){
    // regle si c'est le premier => couleur unique le vert
    // sinon si il a plus de trois lien => orange
    // sinon on est le seul à influencer dessus : bleu
    if(extend){
      for (var i = 0; i < d.related_nodes.length; i++)
      {
        if(d.related_nodes[i]==d.id ||d.related_nodes[i]==from){
          continue;
        }
        var obj = mapinner.get(d.related_nodes[i])||mapouterID.get(d.related_nodes[i]);
        colorALL(obj,false,false,d.id);
      }
      for (var i = 0; i < d.related_links.length; i++){
        var inout = d.related_links[i].split("-")
        if(inout[1] == from ||inout[2] == from){
          continue;
        }
        d3.select('#' + d.related_links[i]).attr('stroke', color1);
        d3.select('#' + d.related_links[i]).attr('stroke-width', '3px');      
      }
    }
    if(first){
      d3.select('#' + d.id + '-txt').attr("fill", color2);
      d3.select('#' + d.id + '-txt').attr("font-weight", 'bold');
      for (var i = 0; i < d.related_links.length; i++){
        d3.select('#' + d.related_links[i]).attr('stroke-width', '3px');
        d3.select('#' + d.related_links[i]).attr('stroke', color2);
      }
    }
    else if(extend&&d.related_nodes.length>2){
      d3.select('#' + d.id  + '-txt').attr("fill", color1);
    d3.select('#' + d.id + '-txt').attr("font-weight", 'bold');
    }
    else{
      if(extend){
        d3.select('#' + d.id  + '-txt').attr("fill", color2);
      }else{
        d3.select('#' + d.id  + '-txt').attr("fill", color1);
      }
      
      d3.select('#' + d.id + '-txt').attr("font-weight", 'bold');
    }
    
    

  }
  
  function colorALL(d,extend,first, from){

    colorNode(d,extend,first, from);

  }

  

  function mouseout(d)
  {     
    for (var i = 0; i < d.related_nodes.length; i++)
    {
      var obj = mapinner.get(d.related_nodes[i])||mapouterID.get(d.related_nodes[i]);
      UnHighlight(obj,true);
    }
    UnHighlight(d,false);
  }
  
function UnHighlight(d,extend){     
  if(extend){
    for (var i = 0; i < d.related_nodes.length; i++)
    {

      var obj = mapinner.get(d.related_nodes[i])||mapouterID.get(d.related_nodes[i]);
      UnHighlight(obj,false);
    }
  }
  var isInner = false;
  for(var i2 = 0;i2<data.inner.length;i2++){
    if(data.inner[i2].id == d.id){
      isInner = true;
    }
  }
  
  if(isInner){
    d3.select('#' + d.id + '-txt').attr("fill", 'black');
  }else{
    d3.select('#' + d.id + '-txt').attr("fill", 'white');
  }

  d3.select('#' + d.id).classed('highlight', false);
  d3.select('#' + d.id + '-txt').attr("font-weight", 'normal');

  for (var i = 0; i < d.related_links.length; i++){
    d3.select('#' + d.related_links[i]).attr('stroke-width', link_width);

    d3.select('#' + d.related_links[i]).attr('stroke', '#dddddd');
  }
}
    function 
   started(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}


  })//find3.json